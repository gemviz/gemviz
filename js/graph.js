/*
 *  Copyright (C) 2011 Peter Abrahamsen
 *
 *  This file is part of the Gemviz package.
 *
 *  Gemviz is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Gemviz is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Gemviz.  If not, see <http://www.gnu.org/licenses/>.
 */

YUI.add('gemviz-graph', function (Y) {
  "use strict";

  var gemviz = Y.namespace('gemviz'),
      Graph = gemviz.Graph = Y.Base.create('graph', Y.Base, [], {
    initializer: function (config) {
      this.genresById = {};

      var container = this.get('container'),
          dragDelegate = this.DD = new Y.DD.Delegate({
            cont: config.container,
            dragMode: 'intersect',
            nodes: '.genre'
          });
      dragDelegate.on('drag:mouseDown', this._onMouseDown, this);
      dragDelegate.on('drag:end', this._onDragEnd, this);

      container.delegate('mousedown', function (evt) {
        evt.currentTarget.setAttribute('class', 'genre selected');
      }, '.genre');

      container.delegate('mouseup', function (evt) {
        var g = evt.currentTarget;
        if (g !== this.connectFrom)
          g.setAttribute('class', 'genre');
      }, '.genre', this);

      this.after('modeChange', function (evt) {
        // !! pending YUI support for addClass on SVG elements
        container.setAttribute('class', 'mode-' + evt.newVal);
      });
      this.set('mode', config.mode || 'move');

      this.publish('addGenre', {defaultFn: Y.bind(this._addGenre, this)});
    },
    newGenre: function (name) {
      var genre = new gemviz.Genre({
            name: name,
            g: this._newGenreG()
          });
      this.fire('addGenre', {genre: genre});
      return genre;
    },
    _addGenre: function (evt) {
      var genre = evt.genre,
          stamp = Y.stamp(genre);
      this.genresById[stamp] = genre;
      genre.once('destroy', function (evt) {
        this.removeGenre(genre);
      }, this);
    },
    removeGenre: function (genre) {
      var stamp = Y.stamp(genre),
          connections = Connection.byGenreId[stamp],
          i;
      for (i = 0; i < connections.length; i++) {
        connections[i].destroy();
      }
      delete this.genresById[stamp];
    },
    _newGenreG: function () {
      var g = this.get('template').cloneNode(true);
      // Remove the 'template' class. removeClass does not work on SVG elements.
      this.get('container').appendChild(g);
      g.setAttribute('class', 'genre');
      return g;
    },
    _onMouseDown: function (evt) {
      if (this.get('mode') == 'connect') {
        evt.halt();
        this._connectG(evt.ev.currentTarget);
      }
    },
    _onDragEnd: function (evt) {
      evt.target.get('node').setAttribute('class', 'genre');
    },
    _connectG: function (g) {
      var connection
      if (this.connectFrom) {
        if (this.connectFrom !== g) {
          connection = Connection.betweenGenres(this.connectFrom.genre, g.genre) || new Connection(this.connectFrom.genre, g.genre);
        }
        this.connectFrom.setAttribute('class', 'genre');
        delete this.connectFrom;
      } else {
        g.setAttribute('class', 'genre connecting selected');
        this.connectFrom = g;
      }
    }
  }, {
    ATTRS: {
      container: { setter: Y.one, value: null },
      mode: { value: null },
      template: { setter: Y.one, value: null }
    }
  });

  function Connection (from, to) {
    var template = Y.one('.connection.template'),
        line = template.cloneNode(true),
        fromStamp = this.fromStamp = Y.stamp(from),
        toStamp = this.toStamp = Y.stamp(to);
    this.from = from;
    this.to = to;
    this.line = line;
    Connection.register(this);

    this.evtListeners = [
      from.after('originChange', this.syncFrom, this),
      to.after('originChange', this.syncTo, this)
    ];
    this.syncFrom();
    this.syncTo();
    line.setAttribute('class', 'connection');
    template.get('parentNode').insertBefore(line, template);
  }
  Connection.prototype = {
    destroy: function () {
      var evtListeners = this.evtListeners,
          i;
      for (i = 0; i < evtListeners; i++) {
        evtListeners[i].detach();
      }
      delete Connection.byGenreIds[this.fromStamp][this.toStamp];
      delete Connection.byGenreIds[this.toStamp][this.fromStamp];
      this.line.remove();
    },
    syncFrom: function () {
      var fromCenter = this.from.get('center');
      this.line.setAttribute('x1', fromCenter[0]);
      this.line.setAttribute('y1', fromCenter[1]);
    },
    syncTo: function () {
      var toCenter = this.to.get('center');
      this.line.setAttribute('x2', toCenter[0]);
      this.line.setAttribute('y2', toCenter[1]);
    }
  };
  Connection.byGenreIds = {};
  Connection.register = function (connection) {
    var registry = Connection.byGenreIds,
        from = connection.from,
        to = connection.to;
    if (! registry[from])
      registry[from] = {};
    if (! registry[to])
      registry[to] = {};

    registry[from][to] = connection;
    registry[to][from] = connection;
  };
  Connection.betweenGenres = function (left, right) {
    var leftStamp = Y.stamp(left),
        rightStamp = Y.stamp(right),
        candidates = Connection.byGenreIds[leftStamp];
    if (candidates)
      return candidates[rightStamp];
  };
}, '0.1', { requires: ['base', 'dd', 'collection'] });
