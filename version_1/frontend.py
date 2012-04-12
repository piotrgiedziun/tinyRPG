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

class MapHandler(AuthRequestHandler):
	@tornado.web.authenticated
	def get(self, map_id):
		self.render("assets/maps/map_%s.json" % (map_id,))
		
class CreateAccountHandler(AuthRequestHandler):
	def prepare(self):
		facebook_user = self.get_secure_cookie("facebook_user", None)
		if not facebook_user: raise tornado.web.HTTPError(500, "Auth failed")
		self.facebook_user = tornado.escape.json_decode(facebook_user)
		
	def get(self):
		self.render("createAccount.html", user=self.facebook_user, error=self.get_argument("error",""))
		
	def post(self):
		error_msg = []
		
		login = self.get_argument("login", "")
		password = self.get_argument("password", "")
		name = self.facebook_user["name"]
		facebook_uid = int(self.facebook_user["uid"])
		facebook_session_key = self.facebook_user["session_key"]
		facebook_profile_url = self.facebook_user["profile_url"]
		
		# input validation
		if not re.match("^[A-Za-z]\w{3,}$", login):
			error_msg.append(u"Invalid username (must be alphanumeric longer than 3 chars)")
		if len(login) < 3:
			error_msg.append(u"Invalid password (must be longer than 3 chars)")
		if len(name) < 3:
			error_msg.append(u"Invalid facebook data")
			
		#check if username is taken
		#check if facebook_id is taken	
			
		if error_msg:		
			self.redirect(u"/create_account" + u"?error=" + tornado.escape.url_escape(",".join(error_msg)))
		else:
			self.db.execute("""INSERT INTO `players` (`id`,`login`,`password`,`name`,`facebook_uid`,`facebook_session_key`,`facebook_profile_url`)
				VALUES (NULL, %s, %s, %s, %s, %s, %s);""", login, password, name, facebook_uid, facebook_session_key, facebook_profile_url)
			self.clear_cookie("facebook_user")
			self.redirect(u"/login" + u"?success=" + tornado.escape.url_escape("Account created. Please login and enjoy the game"))

class FaceLoginHandler(AuthRequestHandler, tornado.auth.FacebookMixin):
	@tornado.web.asynchronous
	def get(self):
		if self.get_argument("session", None):
			self.get_authenticated_user(
				callback=self.async_callback(self._on_auth))
			return
		self.authenticate_redirect()
		
	def _on_auth(self, user):
		if not user: raise tornado.web.HTTPError(500, "Auth failed")
		self.set_secure_cookie("facebook_user", tornado.escape.json_encode(user))
		self.redirect("/create_account")

class FacebookGraphLoginHandler(FaceLoginHandler, tornado.auth.FacebookGraphMixin):
	@tornado.web.asynchronous
	def get(self):
		if self.get_argument("code", False):
			self.get_authenticated_user(
				redirect_uri='/auth/facebookgraph/',
				client_id=self.settings["facebook_api_key"],
				client_secret=self.settings["facebook_secret"],
				code=self.get_argument("code"),
				callback=self.async_callback(self._on_login))
		 	return
		self.authorize_redirect(redirect_uri='/auth/facebookgraph/',
			client_id=self.settings["facebook_api_key"],
			extra_params={"scope": "read_stream,offline_access"})

	def _on_login(self, user):
		logging.error(user)
		self.finish()

class LoginHandler(AuthRequestHandler):
	def get(self):
		self.render("home.html", next=self.get_argument("next","/"), error=self.get_argument("error",""), success=self.get_argument("success",""))

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
			self.render("draw.html", user = self.current_user)
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