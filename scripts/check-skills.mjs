import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { YAML } from "bun";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(root, "skills");
const skills = readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
assert(skills.length > 0, "No skills found.");

for (const skill of skills) {
  const directory = join(skillsRoot, skill.name);
  const entrypoint = join(directory, "SKILL.md");
  const source = readFileSync(entrypoint, "utf8");
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  assert(frontmatter, `${skill.name}: missing YAML frontmatter.`);
  const metadata = YAML.parse(frontmatter[1]);
  assert.equal(metadata.name, skill.name, `${skill.name}: name must match its directory.`);
  assert.equal(metadata["disable-model-invocation"], true, `${skill.name}: skill must require explicit invocation.`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) && metadata.name.length < 64);
  assert(typeof metadata.description === "string" && metadata.description.trim().length > 0);
  assert(source.slice(frontmatter[0].length).trim(), `${skill.name}: missing instructions.`);

  const documents = [entrypoint];
  const references = join(directory, "runtime/guides");
  if (existsSync(references)) {
    for (const name of readdirSync(references)) {
      if (name.endsWith(".md")) documents.push(join(references, name));
    }
  }
  for (const document of documents) {
    const markdown = readFileSync(document, "utf8");
    for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const link = match[1];
      if (/^(?:[a-z]+:|#)/i.test(link)) continue;
      const target = resolve(dirname(document), link.split("#")[0]);
      const localPath = relative(directory, target);
      assert(localPath !== ".." && !localPath.startsWith("../"), `${document}: link leaves skill: ${link}`);
      assert(existsSync(target), `${document}: broken link: ${link}`);
    }
  }

  const agentFile = join(directory, "agents/openai.yaml");
  if (existsSync(agentFile)) {
    const agent = YAML.parse(readFileSync(agentFile, "utf8"));
    assert(agent.interface?.display_name, `${skill.name}: missing display name.`);
    const description = agent.interface?.short_description;
    assert(typeof description === "string" && description.length >= 25 && description.length <= 64);
    assert(agent.interface?.default_prompt?.includes(`$${skill.name}`));
    assert.equal(agent.policy?.allow_implicit_invocation, false, `${skill.name}: implicit invocation must be disabled.`);
  }
  console.log(`Validated ${skill.name}.`);
}
