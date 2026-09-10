# Success requires complete coverage and zero findings

An analysis run succeeds only when all required analyzers complete and no
findings remain; Fix, Enforce, and Review findings all cause failure. Analyzer
failures also make the run unsuccessful, while findings from completed checks
remain available. Keep the classifications because a blocking Review finding
still requires contextual judgment and is not thereby a demonstrated defect.
