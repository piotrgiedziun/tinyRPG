#
# layers:
# - under
# - above
# - collisions

import json
import sys
import math
from PIL import Image

MAP_WIDTH = 28
MAP_HEIGHT = 18
bitmaps = []

def main(inputF, output):
	f = open(inputF)
	data =  json.loads(f.read())

	global bitmaps
	imageheight = 0
	imagewidth = 0
	
	for titleset in data["tilesets"]:
		bitmaps.append({
			'image': Image.open(titleset["image"]),
			'firstgid': titleset["firstgid"],
			'startImageheight': imageheight,
		})
		imageheight += titleset["imageheight"]
		if titleset["imagewidth"] > imagewidth:
			imagewidth = titleset["imagewidth"]
	
	tmpImage = Image.new("RGBA", [imagewidth,imageheight])
	
	for bitmap in bitmaps:
		tmpImage.paste(bitmap["image"], (0,bitmap["startImageheight"]))

	global MAP_WIDTH
	global MAP_HEIGHT
	
	MAP_WIDTH = data["width"]
	MAP_HEIGHT = data["height"] 
	
	# collisions
	collisions = data["layers"].pop()["data"]
	
	# under / above
	under = [i["data"] for i in data["layers"] if i["name"] == "under"]
	above = [i["data"] for i in data["layers"] if i["name"] == "above"]

	# create and optimize map file
	occurrence = []
	lists = []
	
	for u in under:
		lists += u
	for a in above:
		lists += a
	lists += collisions
	
	for l in range(0, max(lists)+1):
		occurrence.insert(l, 0)
	
	for l in lists:
		occurrence[l] += 1
	
	# create output image
	elementsPerLine = int(math.floor(imagewidth/32))
	elementsCount = len([i for i in occurrence if i > 0])
	linesCount = int(math.ceil(elementsCount/float(elementsPerLine)))

	outputImage = Image.new("RGBA", [imagewidth,linesCount*32])
	
	# copy to new image
	idsToChange = []
	j = 0
	for i in range(1, max(lists)+1):
		currentX = (i-1) % elementsPerLine
		currentY = int(math.floor(i/elementsPerLine))

		if occurrence[i] > 0:
			outputX = j % elementsPerLine
			outputY =  int(math.floor(j/elementsPerLine))
			
			crop = tmpImage.crop((currentX*32, currentY*32, (currentX*32)+32, (currentY*32)+32))
			outputImage.paste(
				crop,
				(outputX*32, outputY*32)
			)
			
			idsToChange.append({
				'new': j+1,
				'old': i
			})
			
			j += 1

	# save image file
	outputImage.save(output+".png")
	
	# replace old numering system
	for i in idsToChange:
		
		for uni, un in enumerate(under):
			for ui, u in enumerate(un):
				if under[uni][ui] == i["old"]:
					under[uni][ui] = i["new"]
					
		for abi, ab in enumerate(above):
			for ai, a in enumerate(ab):
				if above[abi][ai] == i["old"]:
					above[abi][ai] = i["new"]
		
	# create array structure
	map_under = map_above = map_collisions = []
	
	map_under = create_map(under)
	map_above = create_map(above)
	map_collisions = create_collisions_map(collisions)
	
	dataToReturn = {
		"under": map_under,
		"above": map_above,
		"collisions": map_collisions
	}
	
	w = open(output+".json", "w")
	w.write(json.dumps(dataToReturn))

def create_collisions_map(collection):
	map = []
	for y in range(0, MAP_HEIGHT):
		map.insert(y, [])
		for x in range(0, MAP_WIDTH):
			if collection[(y*MAP_WIDTH)+x] != 0:
				map[y].insert(x, 1)
			else:
				map[y].insert(x, 0)
				
	return map

def create_map(collection):
	map = []
	
	if collection:
		for y in range(0, MAP_HEIGHT):
			map.insert(y, [])
			for x in range(0, MAP_WIDTH):
				map[y].insert(x, [])
			
		#fill array
		for c in collection:
			for y in range(0, MAP_HEIGHT):
				for x in range(0, MAP_WIDTH):
					map[y][x].append(c[(y*MAP_WIDTH)+x])
	else:
		#create empty map
		for y in range(0, MAP_HEIGHT):
			map.insert(y, [])
			for x in range(0, MAP_WIDTH):
				map[y].insert(x, [0])
				
	return map
	
if __name__ == "__main__":
	if len(sys.argv) > 2:
		output = sys.argv[2]
	else:
		outputF = raw_input("output file: ")
	if len(sys.argv) > 1:
		inputF = sys.argv[1]
	else:
		inputF = raw_input("input file: ")	
	
	main(inputF, output)
	
