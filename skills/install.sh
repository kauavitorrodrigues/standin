#!/usr/bin/env bash
# Installs the skills of this folder so an agent harness can use them.
#
#   ./skills/install.sh                  symlink into ~/.claude/skills (stays up to date with git pull)
#   ./skills/install.sh --target codex   use the folder of another harness (claude, codex)
#   ./skills/install.sh --dest DIR       install into any skills folder
#   ./skills/install.sh --copy           copy instead of linking (frozen until you run it again)
#   ./skills/install.sh --project        project-level folder (<repo>/.claude/skills, or .codex/skills)
#   ./skills/install.sh --force          replace a skill that is already installed
set -euo pipefail

src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(dirname "$src")"
target=claude
dest=""
project=0
mode=link
force=0

while [ $# -gt 0 ]; do
    case "$1" in
        --copy) mode=copy ;;
        --project) project=1 ;;
        --force) force=1 ;;
        --target) target="${2:?--target needs a value}"; shift ;;
        --dest) dest="${2:?--dest needs a folder}"; shift ;;
        -h | --help)
            sed -n '2,9p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
            exit 0
            ;;
        *)
            echo "Unknown option: $1 (try --help)" >&2
            exit 1
            ;;
    esac
    shift
done

if [ -z "$dest" ]; then
    case "$target" in
        claude) folder=".claude/skills" ;;
        codex) folder=".codex/skills" ;;
        *)
            echo "Unknown target: $target (use claude, codex or --dest DIR)" >&2
            exit 1
            ;;
    esac
    if [ "$project" -eq 1 ]; then dest="$repo/$folder"; else dest="$HOME/$folder"; fi
fi

mkdir -p "$dest"
installed=0

for dir in "$src"/*/; do
    [ -f "$dir/SKILL.md" ] || continue
    name="$(basename "$dir")"
    target="$dest/$name"
    dir="${dir%/}"

    if [ -L "$target" ] && [ "$(readlink "$target")" = "$dir" ]; then
        echo "ok       $name (already linked)"
        continue
    fi

    if [ -e "$target" ] || [ -L "$target" ]; then
        if [ "$force" -ne 1 ]; then
            echo "skipped  $name ($target already exists, use --force to replace it)"
            continue
        fi
        rm -rf "$target"
    fi

    if [ "$mode" = link ]; then
        ln -s "$dir" "$target"
        echo "linked   $name -> $target"
    else
        cp -R "$dir" "$target"
        echo "copied   $name -> $target"
    fi
    installed=$((installed + 1))
done

echo "Done. $installed installed into $dest. Restart the agent if it was already open."
