# -*- coding: utf-8 -*-
import tornado.web
import tornado.database
import tornado.escape
from tornado.options import options
import tornado.auth
import re
import memcache

class AuthRequestHandler(tornado.web.RequestHandler):
	def initialize(self):
		self.db = tornado.database.Connection("localhost", "test", user="root", password="root")
	
	def get_current_user(self):
		user = self.get_secure_cookie("user")

		if user:
			return tornado.escape.json_decode(user)
		else:
			return None

class LoginHandler(AuthRequestHandler):
	def get(self):
		self.render("templates/home.html", next=self.get_argument("next","/"), error=self.get_argument("error",""), success=self.get_argument("success",""))

	def post(self):
		login = self.get_argument("login", "")
		password = self.get_argument("password", "")

		auth = self.db.get(u"SELECT id, login, name FROM players WHERE login = %s AND password = %s", login, password)

		if auth:
			self.set_current_user({
				'id': auth.id,
				'login': auth.login,
				'name': auth.name,
			})
			self.redirect(self.get_argument("next", u"/"))
		else:
			error_msg = u"?error=" + tornado.escape.url_escape("Incorrect login or password")
			self.redirect(u"/login" + error_msg)

	def set_current_user(self, user):
		if user:
			self.set_secure_cookie("user", tornado.escape.json_encode(user))
		else:
			self.clear_cookie("user")

class LogoutHandler(AuthRequestHandler):
	def get(self):
		self.clear_cookie("user")
		self.redirect(u"/login")

class HomeHandler(AuthRequestHandler):
	@tornado.web.authenticated
	def get(self):
		if self.current_user:
			self.render("templates/game.html", user = self.current_user)
		else:
			self.redirect("/login")

class MemcacheView(AuthRequestHandler):
	def get(self):
		memc = memcache.Client(servers=['127.0.0.1:11211',], debug=1);

		table = memc.get('table')

		if not table:
		    rows = self.db.query('select * from `table` limit 5')
		    memc.set('table', rows, options.cache_time)
		    print "Updated memcached with MySQL data"
		    for row in rows:
		        print "%s, %s" % (row[0], row[1])
		else:
		    print "Loaded data from memcached"
		    for row in table:
		        print "%s, %s" % (row[0], row[1])