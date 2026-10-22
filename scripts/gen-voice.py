import asyncio
import edge_tts

async def generate():
    text = "Welcome to Need Electro, your trusted electrical and technological solutions."
    # en-US-AriaNeural is widely recognized as one of the most natural, human-sounding female voices
    communicate = edge_tts.Communicate(text, voice="en-US-AriaNeural", rate="-3%", pitch="+1Hz")
    await communicate.save("public/welcome-voice.mp3")
    print("Successfully generated public/welcome-voice.mp3")

if __name__ == "__main__":
    asyncio.run(generate())
