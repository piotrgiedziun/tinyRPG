#
# layers:
# - background
# - object
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
	
	mapImage = Image.new("RGBA", [imagewidth,imageheight])
	
	for bitmap in bitmaps:
		mapImage.paste(bitmap["image"], (0,bitmap["startImageheight"]))

	global MAP_WIDTH
	global MAP_HEIGHT
	
	MAP_WIDTH = data["width"]
	MAP_HEIGHT = data["height"] 
	
	# collisions
	collisions = data["layers"].pop()["data"]
	
	# under / above
	backgrounds = [i["data"] for i in data["layers"] if i["name"] == "background"]
	objects = [i["data"] for i in data["layers"] if i["name"] == "object"]

	# position maper
	pos_maper = []
	imageheight = 0
	
	for tileset in data["tilesets"]:
		itemPerLine = int(math.floor(tileset["imagewidth"]/tileset["tilewidth"]))
		linesCount = int(math.ceil(tileset["imageheight"]/tileset["tileheight"]))
		startId = tileset["firstgid"]

		for itemId in range(0, itemPerLine*linesCount):
			itemX = (itemId % itemPerLine)*tileset["tilewidth"]
			itemY = imageheight+int(math.floor(itemId/itemPerLine))*tileset["tileheight"]
			pos_maper.insert(startId+itemId, {
				'x': itemX,
				'y': itemY,
				'w': tileset["tilewidth"],
				'h': tileset["tileheight"],
			})
			
		imageheight += tileset["imageheight"]
		
	# create array structure
	map_backgrounds = map_objects = map_collisions = []
	
	map_backgrounds = create_map(backgrounds)
	map_objects = create_map(objects)
	map_collisions = create_collisions_map(collisions)
	
	dataToReturn = {
		"positionMaper": pos_maper,
		"background": map_backgrounds,
		"object": map_objects,
		"collisions": map_collisions
	}
	
	w = open(output+".json", "w")
	w.write(json.dumps(dataToReturn))
	mapImage.save(output+".png")

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
	
