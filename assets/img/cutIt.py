import Image

start = 0
img = Image.open("infile.png")
img = img.convert("RGBA")

for y in range(0, 2):
	for x in range(0, 4):
		#(left, upper, right, lower)
		box = (x*3*32, y*4*32, (x*3*32)+(32*3), (y*4*32)+(32*4))
		region = img.crop(box)
		region.save("character_%s.png" % (start+(x+(y*4)),), "PNG")