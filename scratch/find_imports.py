import ast
import os

def get_imports(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        try:
            tree = ast.parse(f.read(), filename=filepath)
        except SyntaxError:
            return set()
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split('.')[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split('.')[0])
    return imports

stdlib = {"sys", "os", "json", "ast", "time", "datetime", "uuid", "typing", "collections", "abc", "io", "logging", "hashlib", "re", "math", "pathlib", "subprocess"}

all_imports = set()
for root, _, files in os.walk(r"c:\Users\souvi\OneDrive\Desktop\nirikshak"):
    if "venv" in root or ".git" in root or "__pycache__" in root or "frontend" in root:
        continue
    for file in files:
        if file.endswith(".py"):
            filepath = os.path.join(root, file)
            all_imports.update(get_imports(filepath))

external = sorted([i for i in all_imports if i not in stdlib and i not in {"app", "ai", "data_ingestion", "database", "integrations", "policy_engine", "workers", "documents", "tests", "scripts"}])
print("External imports:")
print(external)
