import base64
from captcha.image import ImageCaptcha

print("Generating...")
image = ImageCaptcha(width=160, height=60)
data = image.generate('ABCDE')
print("Done")
