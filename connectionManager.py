class connectionManager():
	
	def __init__(self):
		self.connections = []
		
	def __iter__(self):
		return self.connections
	
	def inRoom(self, room):
		return [connection for connection in self.connections if connection.player.room == room]  
		
	def add(self, connection):
		if not connection in self.connections:
			self.connections.append(connection)
			
	def has(self, connection):
		return connection in self.connections
	
	def hasPlayer(self, player):
		return any([connection for connection in self.connections if connection.player.id == player.id])	
		
	def remove(self, connection):
		if connection in self.connections:
			self.connections.remove(connection)