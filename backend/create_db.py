import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to 'postgres' db to create 'yarvo' db
conn = psycopg2.connect(
    dbname='postgres',
    user='postgres',
    password='Password@pos1',
    host='localhost',
    port='5432'
)

conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

db_name = 'yarvo'

# Check if db exists
cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
exists = cur.fetchone()

if not exists:
    print(f"Creating database {db_name}...")
    cur.execute(f"CREATE DATABASE {db_name}")
    print("Database created.")
else:
    print(f"Database {db_name} already exists.")

cur.close()
conn.close()
