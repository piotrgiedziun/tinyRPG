
var Map = Class.create( {

    initialize: function() {
        this.under = [];
	//	this.above = [];
		this.collisions = [];
    },
	
	loadMap: function(url, callback) {
		var inst = this;
		httpRequest(url, function(d) {
			inst.height = d.collisions.length;
			inst.width = d.collisions[0].length;
			inst.collisions  = d.collisions;
			inst.under = d.under;
			inst.above = d.above;
			callback()
		}, true);
	},

    getElementUnderId: function(x, y, l) {
		if(l == undefined) {
			return this.under[y][x];
		}
        return this.under[y][x][l];
    },

    getElementAboveId: function(x, y, l) {
		if(l == undefined) {
			return this.above[y][x];
		}
       	return this.above[y][x][l];
    },

    findPath: function(f_x, f_y, t_x, t_y) {
        return dijkstra.find_path(this.collisions, [f_x,f_y], [t_x,t_y]);
    }
});

/******************************************************************************
 * Created 2008-08-19.
 *
 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
 *
 * Copyright (C) 2008
 *   Wyatt Baldwin <self@wyattbaldwin.com>
 *   All rights reserved
 *
 * Licensed under the MIT license.
 *
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *****************************************************************************/
var dijkstra = {
    single_source_shortest_paths: function(graph, s, d) {

        var predecessors = {};
        var costs = {};
        costs[s] = 0;

        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);

        var closest,
            u,
            adjacent_nodes,
            new_path,
            current_path,
            row_size = graph[0].length;

        while (open) {
            closest = open.pop();
            if(closest == undefined) break;

            u = closest.value;

            // Get nodes adjacent to u...
            var x = u[0], y = u[1];
            adjacent_nodes = new Array();

            var nodes = {0:[x+1, y], 1:[x-1, y], 2:[x, y+1], 3:[x, y-1]};
            for(var pos in nodes) {
                var x = nodes[pos][0], y = nodes[pos][1];
                if(graph[y] != undefined && graph[y][x] != undefined && graph[y][x] == 0)
                    adjacent_nodes.push([x, y]);
            }

            for (var v_id=0; v_id<adjacent_nodes.length; v_id++) {

                var v = adjacent_nodes[v_id];

                new_path = closest.cost + 1;

                var id = v[0]+(v[1]*row_size);

                current_path = costs[id];

                if ((typeof costs[id] === 'undefined') || current_path > new_path) {
                    costs[id] = new_path;
                    open.push(v, new_path);
                    predecessors[id] = [u[0], u[1]];
                }

                if (v[0] === d[0] && v[1] === d[1]) {
                    open = null;
                    break;
                }
            }
        }

        if (costs[d[0]+(d[1]*row_size)] == undefined) {
            var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
            throw new Error(msg);
        }
        return predecessors;
    },

    extract_shortest_path_from_predecessor_list: function(graph, predecessors, d, s) {
        var nodes = [], instructions = [],
            row_size = graph[0].length,
            u = d,
            instruction;

        while ((u[0]!=s[0] || u[1]!=s[1])) {
            nodes.push(u);
            u = predecessors[u[0]+(u[1]*row_size)];
        }
        nodes.push(s);
        nodes.reverse();

        for(var i = 0; i < nodes.length-1; i++) {
            var c_x = nodes[i][0], c_y = nodes[i][1],
                n_x = nodes[i+1][0], n_y = nodes[i+1][1];

            if(c_x != n_x)
                instruction = n_x > c_x ? 'R' : 'L';
            else
                instruction = n_y > c_y ? 'D' : 'U';

            instructions.push(instruction);
        }
        console.log(instructions);
        return instructions;
    },

    find_path: function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(graph, predecessors, d, s);
    },

    PriorityQueue: {
        make: function (opts) {
            var T = dijkstra.PriorityQueue,
                t = {},
                opts = opts || {},
                key;
            for (key in T) {
                t[key] = T[key];
            }
            t.queue = [];
            return t;
        },
        default_sorter: function (a, b) {
            return a.cost - b.cost;
        },

        push: function (value, cost) {
            var item = {value: value, cost: cost};
            this.queue.push(item);
            this.queue.sort(this.default_sorter);
        },
        pop: function () {
            return this.queue.shift();
        }
    }
};