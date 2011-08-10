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

      var dragDelegate = this.DD = new Y.DD.Delegate({
        cont: config.container,
        dragMode: 'intersect',
        nodes: '.genre',
        target: true
      });
      dragDelegate.on('drag:start', this.onDragStart, this);
      dragDelegate.on('drag:end', this.onDragEnd, this);
      dragDelegate.on('drag:drophit', this.onDropHit, this);
      dragDelegate.on('drag:dropmiss', this.onDropMiss, this);

      this.publish('didAddGenre', {});
    },
    addGenre: function (genre) {
      var stamp = Y.stamp(genre);
      this.instances[stamp] = genre;
      this.fire('didAddGenre', genre);
    },
    newGenre: function (name) {
      var genre = new gemviz.Genre({
            name: name,
            g: this._newGenreG()
          });
      this.addGenre(genre);
      return genre;
    },
    _newGenreG: function () {
      var g = this.get('template').cloneNode(true);
      // Remove the 'template' class. removeClass does not work on SVG elements.
      g.setAttribute('class', 'genre');
      return g;
    }
  }, {
    ATTRS: {
      container: { setter: Y.one, value: null },
      template: { setter: Y.one, value: null }
    },
  });
}, '0.1', { requires: ['base', 'dd', 'collection'] });
