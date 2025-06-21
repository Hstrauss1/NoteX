## Create virtual environment

```bash
python3 -m venv .venv
```

## Activate virtual environment

Unix/MacOS (assuming your virtual environment is in a directory named `.venv`)

```bash
source .venv/bin/activate
```

## Install dependencies

```bash
pip3 install -r requirements.txt
```

## Run the dev server

```bash
python3 app.py
```

## Environment Variables

```bash
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_JWT_SECRET
```
