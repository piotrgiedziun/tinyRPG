# -*- coding: utf-8 -*-\
import tornado.web
import tornado.escape
import tornado.websocket
from connectionManager import connectionManager
from player import Player

connections = connectionManager()

class AuthWebSocketHandler(tornado.websocket.WebSocketHandler):
	def initialize(self):
		self.db = tornado.database.Connection("localhost", "test", user="root", password="root")
	
	def get_current_user(self):
		user = self.get_secure_cookie("user")

		if user:
			return tornado.escape.json_decode(user)
		else:
			return None

class ClientSocket(AuthWebSocketHandler):

	player = None

	def allow_draft76(self):
		return True
		
	def open(self):
		user = self.get_current_user()
		if not user:
			raise tornado.web.HTTPError(500)
		
		player = self.db.get(u"SELECT id, name FROM players WHERE id = %s", user["id"])
		
		if not player:
			raise tornado.web.HTTPError(500)
			
		self.player = Player(player.id, player.name, 3, 1, "D")
		
		self.write_message(self.player.aboutRequestData())

	def on_message(self, message):
		if self.player == None: raise tornado.web.HTTPError(500)
		data = tornado.escape.json_decode(message)

			
		if data["type"] == "player":
			for connection in connections.inRoom(self.player.room):
				if connection.player == self.player: continue
				self.player.update(data["x"], data["y"], data["direction"])
				connection.write_message(self.player.updateRequestData())
		elif data["type"] == "message":
			for connection in connections.inRoom(self.player.room):
				if connection.player == self.player: continue
				connection.write_message(tornado.escape.json_encode({
					'type': "message",
					'author': self.player.name,
					'text': tornado.escape.xhtml_escape(data["message"]),
				}))
		elif data["type"] == "ready":
			if connections.hasPlayer(self.player):
				raise tornado.web.HTTPError(500)
				
			for connection in connections.inRoom(self.player.room):
				connection.write_message(self.player.initRequestData())
				self.write_message(connection.player.initRequestData())
			connections.add(self)
		else:
			raise tornado.web.HTTPError(500)
		
	def on_close(self):
		if self.player == None: raise tornado.web.HTTPError(500)
		connections.remove(self)
		for connection in connections.inRoom(self.player.room):
			connection.write_message(self.player.deleteRequestData())