# -*- coding: utf-8 -*-
import uuid
import json

class Player():
	
	def __init__(self, id, name, x, y, direction):
		#self.id = uuid.uuid4()
		self.id = id
		self.name = name
		self.x = x
		self.y = y
		self.direction = direction
		self.room = 1
		self.text = ""
	
	def initRequestData(self):
		return json.dumps({
			'type': "initPlayer",
			'id': int(self.id),
			'name': self.name,
			'x': int(self.x),
			'y': int(self.y),
		})
		
	def aboutRequestData(self):
		return json.dumps({
			'type': "aboutPlayer",
			'id': int(self.id),
			'x': int(self.x),
			'y': int(self.y),
			'name': self.name,
			'direction': self.direction,
		})	
		
	def updateRequestData(self):
		return json.dumps({
			'type': "updatePlayer",
			'id': int(self.id),
			'x': int(self.x),
			'y': int(self.y),
			'direction': self.direction,
		})
		
	def deleteRequestData(self):
		return json.dumps({
			'type': "removePlayer",
			'id': int(self.id),
		})
	
	def update(self, x, y, direction):
		#data validation
		self.x = int(x)
		self.y = int(y)
		self.direction = direction;
	
	def save(self):
		pass
		
	def reload(self):
		pass