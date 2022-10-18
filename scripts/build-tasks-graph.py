# This script is rather unnecessary now that we have the UI to edit the
# Project Graph....

from neo4j import GraphDatabase
import re

uri = "neo4j://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "l0wsecurity"))

"""
def create_word(tx, chars):
	tx.run("CREATE (a :Word {chars: $chars})",
		chars=chars)

def create_char(tx, char):
	tx.run("CREATE (a :Char) WHERE a.char = $char",
		char=char)

def create_rel(tx, char, chars):
	# "MERGE (b :Word {chars: $chars}) "
	tx.run( "MERGE (a :Char {char: $char}) "
			"MERGE (b :Word {chars: $chars}) "
			"MERGE (a)-[:In]->(b)",
			char=char, chars=chars)
"""

def create_node(tx, name):
	tx.run( "CREATE (a :Node {name: $name})",
			name=name)

with driver.session(database = "SnowCrossing") as session:

	# print(dir(session))
	# print(session._config)
	print("Using Database:", session._config['database'])

	session.write_transaction(create_node, "Root")
	session.write_transaction(create_node, "Business plan")
	session.write_transaction(create_node, "Technical white paper")
	session.write_transaction(create_node, "Web site")
	session.write_transaction(create_node, "Git interface")
	session.write_transaction(create_node, "Neo4j interface")
	session.write_transaction(create_node, "Chatroom interface")
	session.write_transaction(create_node, "DAO interface")

	# Link all nodes as children of 'root'
	session.write_transaction( lambda tx: tx.run(
		"MATCH (a:Node), (b:Node) WHERE b.name = 'Root'"
		"CREATE (a)-[r:SubTask]->(b)"
		) )

	# Remove self-loop
	session.write_transaction( lambda tx: tx.run(
		"MATCH (n:Node)-[r]->(n) WHERE n.name = 'Root' DELETE r"
		) )

driver.close()
print("Successfully created Tasks graph.")
exit(0)
