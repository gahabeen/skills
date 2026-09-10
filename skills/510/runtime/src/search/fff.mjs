import { randomUUID } from "node:crypto";
import { mkdirSync, realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { loadTool } from "../runtime/packages.mjs";
import { storageFor } from "../runtime/storage.mjs";

function unwrap(result) {
  if (!result.ok) throw new Error(`FFF: ${result.error}`);
  return result.value;
}

export class RepositorySearch {
  #root;
  #finder;
  #opening;
  #closed = false;
  #cursors = new Map();

  constructor(root) {
    this.#root = realpathSync(root);
    if (!statSync(this.#root).isDirectory()) throw new Error("Search root must be a directory.");
  }

  async #open() {
    const { FileFinder } = await loadTool("@ff-labs/fff-node", this.#root);
    const cache = resolve(storageFor(this.#root).cache, "fff");
    mkdirSync(cache, { recursive: true });
    const finder = unwrap(FileFinder.create({ basePath: this.#root, aiMode: true, followSymlinks: false,
      enableHomeDirScanning: false, enableFsRootScanning: false,
      frecencyDbPath: resolve(cache, "frecency"), historyDbPath: resolve(cache, "history") }));
    if (this.#closed) { finder.destroy(); throw new Error("Repository search has closed."); }
    this.#finder = finder;
    return finder;
  }

  async #ready() {
    if (this.#closed) throw new Error("Repository search has closed.");
    if (!this.#opening) this.#opening = this.#open().catch((error) => { this.#opening = undefined; throw error; });
    const finder = await this.#opening;
    if (!unwrap(await finder.waitForIndexReady(15_000))) throw new Error("FFF indexing is incomplete; retry search after indexing finishes.");
    if (this.#closed) throw new Error("Repository search has closed.");
    return finder;
  }

  async findFiles(query, page = 0, limit = 20) {
    const finder = await this.#ready();
    const result = unwrap(finder.fileSearch(query, { pageIndex: page, pageSize: limit }));
    return { root: this.#root, ...result, nextPage: (page + 1) * limit < result.totalMatched ? page + 1 : null };
  }

  async search(patterns, { constraints = "", cursor, limit = 50, context = 2 } = {}) {
    const finder = await this.#ready();
    const signature = JSON.stringify({ patterns, constraints, limit, context });
    const previous = cursor ? this.#cursors.get(cursor) : null;
    if (cursor && (!previous || previous.signature !== signature)) throw new Error("Unknown search cursor or changed query. Start a new search.");
    const result = unwrap(finder.multiGrep({ patterns, constraints, cursor: previous?.native,
      pageSize: limit, beforeContext: context, afterContext: context, smartCase: true,
      classifyDefinitions: true, maxMatchesPerFile: 0, timeBudgetMs: 1000 }));
    let nextCursor = null;
    if (result.nextCursor) {
      nextCursor = randomUUID();
      this.#cursors.set(nextCursor, { signature, native: result.nextCursor });
      if (this.#cursors.size > 100) this.#cursors.delete(this.#cursors.keys().next().value);
    }
    return { root: this.#root, ...result, nextCursor,
      limitation: "Indexed search is navigation evidence. Ignored, binary, and oversized files may be excluded; analysis establishes its own coverage." };
  }

  close() { this.#closed = true; this.#finder?.destroy(); this.#cursors.clear(); }
}
