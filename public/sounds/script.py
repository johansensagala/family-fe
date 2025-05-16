from pydub import AudioSegment

# Load file audio
audio1 = AudioSegment.from_file("bonus.mp3")  # durasi 3 detik
audio2 = AudioSegment.from_file("siren.mp3")  # durasi 5 detik

# Panjangkan audio1 jika perlu agar bisa di-mix tanpa jadi pendek
if len(audio1) < len(audio2):
    audio1 = audio1 + AudioSegment.silent(duration=len(audio2) - len(audio1))
elif len(audio2) < len(audio1):
    audio2 = audio2 + AudioSegment.silent(duration=len(audio1) - len(audio2))

# Gabungkan (mix)
combined = audio1.overlay(audio2)

# Simpan hasilnya
combined.export("hasil_mix.mp3", format="mp3")
