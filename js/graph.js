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
      this.instances = {};

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
        if (g != this.connectFrom)
          g.setAttribute('class', 'genre');
      }, '.genre', this);

      this.after('modeChange', function (evt) {
        // !! pending YUI support for addClass on SVG elements
        container.setAttribute('class', 'mode-' + evt.newVal);
      });
      this.set('mode', config.mode || 'move');

      this.publish('addGenre', {defaultFn: Y.bind(this._addGenre, this)});
      this.publish('removeGenre', {defaultFn: Y.bind(this._removeGenre, this)});
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
      this.instances[stamp] = genre;
      genre.after('destroy', function (evt) {
        this.fire('removeGenre', {genre: genre});
      }, this);
    },
    _removeGenre: function (evt) {
      var genre = evt.genre,
          stamp = Y.stamp(genre);
      delete this.instances[stamp];
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
      if (this.connectFrom) {
        if (this.connectFrom == g)
          this._resetConnection();
        else
          this._finishConnection(g.genre);
      } else {
        this._startConnection(g.genre);
      }
    },
    _startConnection: function (genre) {
      genre.g.setAttribute('class', 'genre connecting selected');
      this.connectFrom = genre.g;
    },
    _finishConnection: function (connectTo) {
      // ...
      this._resetConnection();
    },
    _resetConnection: function () {
      this.connectFrom.setAttribute('class', 'genre');
      delete this.connectFrom;
    }
  }, {
    ATTRS: {
      container: { setter: Y.one, value: null },
      mode: { value: null },
      template: { setter: Y.one, value: null }
    },
  });
}, '0.1', { requires: ['base', 'dd', 'collection'] });
