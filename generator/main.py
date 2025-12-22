import json
import sys
import argparse
import os
import requests
from generator import generate_data

# Default schema with all types of fields and constraints
DEFAULT_SCHEMA = {
    "primitive_string": {"type": "string"},
    "string_with_regex": {"type": "string", "regex": "^[A-Z]{3}[0-9]{2}$"},
    "string_with_enum": {"type": "string", "enum": ["red", "green", "blue"]},
    "integer_basic": {"type": "integer"},
    "integer_with_range": {"type": "integer", "min": 10, "max": 100},
    "float_basic": {"type": "float"},
    "float_with_range": {"type": "float", "min": 0.5, "max": 99.9},
    "boolean_field": {"type": "boolean"},
    "uuid_field": {"type": "uuid"},
    "name_field": {"type": "name"},
    "email_field": {"type": "email"},
    "phone_field": {"type": "phone"},
    "date_field": {"type": "date", "min": "2000-01-01", "max": "2030-12-31"},
    "image_url_field": {"type": "image_url"},
    "file_url_field": {"type": "file_url"},
    "array_of_integers": {
        "type": "array",
        "length": 5,
        "items": {"type": "integer", "min": 1, "max": 50}
    },
    "array_of_strings": {
        "type": "array",
        "length": 3,
        "items": {"type": "string", "enum": ["apple", "banana", "cherry"]}
    },
    "nested_object": {
        "type": "object",
        "schema": {
            "street": {"type": "string"},
            "city": {"type": "string"},
            "zipcode": {"type": "integer", "min": 10000, "max": 99999},
            "coordinates": {
                "type": "object",
                "schema": {
                    "lat": {"type": "float", "min": -90, "max": 90},
                    "lng": {"type": "float", "min": -180, "max": 180}
                }
            }
        }
    }
}

# Default schema file path
default_schema_path = os.path.join(os.path.dirname(__file__), "..", "example-schema.json")

def ensure_schema_file(path):
    if not os.path.exists(path):
        try:
            with open(path, "w") as f:
                json.dump(DEFAULT_SCHEMA, f, indent=4)
            print(f"File not found at {path}. Created example-schema.json.")
        except Exception as e:
            print(f"Failed to create schema file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(f"Using existing schema file: {path}")

def generate_multiple(schema, count):
    unique_tracker = {}
    return [generate_data(schema, unique_tracker) for _ in range(count)]

def send_to_apis(data, urls):
    for url in urls:
        url = url.strip()
        if not url:
            continue
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                print(f"Data successfully sent to {url}")
            else:
                print(f"Failed to send data to {url}. Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            print(f"Error sending data to {url}: {e}", file=sys.stderr)

def run_from_stdin():
    try:
        input_data = json.load(sys.stdin)
        schema = input_data["schema"]
        count = input_data.get("count", 1)
        data = generate_multiple(schema, count)
        print(json.dumps(data))
    except Exception as e:
        print("ERROR:", e, file=sys.stderr)

def run_from_cli():
    parser = argparse.ArgumentParser(description="Mock Data Forge")
    parser.add_argument("-s", "--schema", type=str, default=default_schema_path, help="Path to schema JSON file (defaults to example-schema.json)")
    parser.add_argument("-c", "--count", type=int, default=1, help="Number of objects to generate (defaults to 1)")
    parser.add_argument("-a", "--api", type=str, help="Optional comma-separated API endpoints to send generated data, e.g., 'http://api1.com,http://api2.com'")
    args = parser.parse_args()

    ensure_schema_file(args.schema)

    try:
        with open(args.schema) as f:
            schema = json.load(f)
    except Exception as e:
        print(f"Failed to read schema file: {e}", file=sys.stderr)
        sys.exit(1)

    data = generate_multiple(schema, args.count)
    print(json.dumps(data, indent=4))

    # Sends to APIs if provided
    if args.api:
        api_list = args.api.split(",")
        send_to_apis(data, api_list)

def main():
    if not sys.stdin.isatty():
        run_from_stdin()
    else:
        run_from_cli()

if __name__ == "__main__":
    main()