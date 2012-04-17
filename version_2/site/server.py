# -*- coding: utf-8 -*-
import os
import tornado.httpserver
import tornado.ioloop
import tornado.web
from tornado.options import define, options

import frontend
import backend
import config as settings

define("port", default=8888, type=int)
define("cache_time", default=60, type=int)

def main():
	tornado.options.parse_command_line()
	application = tornado.web.Application([
		(r"/map/(.*?)", tornado.web.StaticFileHandler, {
			"path": os.path.join(os.path.dirname(__file__), "../maps/output")
		}),
		(r"/socket", backend.ClientSocket),
		(r"/login", frontend.LoginHandler),
		(r"/logout", frontend.LogoutHandler),
		(r"/", frontend.HomeHandler),
		(r"/assets/(.*?)", tornado.web.StaticFileHandler, {
			"path": os.path.join(os.path.dirname(__file__), "assets")
		}),
		(r"/game/(.*?)", tornado.web.StaticFileHandler, {
			"path": os.path.join(os.path.dirname(__file__), "../game")
		}),
	], **settings.data)
	
	http_server = tornado.httpserver.HTTPServer(application)
	http_server.listen(options.port)
	tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
	main()
