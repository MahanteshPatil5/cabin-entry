import pandas as pd
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Svce@2024",
    database="community_center"
)

df = pd.read_sql("SELECT * FROM entry_logs", conn)
df.to_excel("output.xlsx", index=False)

print("Excel file created successfully!")