#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ART_DIR="$ROOT_DIR/art"
OUTPUT_FILE="$ROOT_DIR/data/gallery.json"

if [[ ! -d "$ART_DIR" ]]; then
  echo "art directory not found: $ART_DIR" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

json_escape() {
  jq -Rn --arg value "$1" '$value'
}

{
  echo "["

  first_folder=1
  while IFS= read -r folder_path; do
    folder_name="$(basename "$folder_path")"

    if [[ $first_folder -eq 0 ]]; then
      echo ","
    fi
    first_folder=0

    echo "  {"
    echo "    \"folder\": $(json_escape "$folder_name"),"
    echo "    \"images\": ["

    first_image=1
    while IFS= read -r image_path; do
      image_name="$(basename "$image_path")"
      image_name_no_ext="${image_name%.*}"
      relative_path="${image_path#$ROOT_DIR/}"

      if [[ $first_image -eq 0 ]]; then
        echo ","
      fi
      first_image=0

      printf "      {\"src\": %s, \"name\": %s}" \
        "$(json_escape "$relative_path")" \
        "$(json_escape "$image_name_no_ext")"
    done < <(
      find "$folder_path" -maxdepth 1 -type f \
        \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" -o -iname "*.avif" \) \
        | LC_ALL=C sort
    )

    echo
    echo "    ]"
    echo -n "  }"
  done < <(find "$ART_DIR" -mindepth 1 -maxdepth 1 -type d | LC_ALL=C sort)

  echo
  echo "]"
} > "$OUTPUT_FILE"

echo "Generated $OUTPUT_FILE"
