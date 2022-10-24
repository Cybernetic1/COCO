import discord
import os

# This allows to read env variables from .env file:
#	pip3 install python-dotenv
from dotenv import load_dotenv
load_dotenv()

intents = discord.Intents(messages=True, guilds=True)
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

# This seems to detect only PRIVATE messages:
@client.event
async def on_message(message):
    if message.author == client.user:
        print("Self-detected:", client.user)

    if message.content.startswith('$hi'):
        await message.channel.send('Hello!')

client.run(os.getenv('TOKEN'))
