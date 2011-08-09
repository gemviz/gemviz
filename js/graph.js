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
 *  along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

YUI.add('gemviz-graph', function (Y) {
  var gemviz = Y.namespace('gemviz'),
      Graph = gemviz.Graph = Y.Base.create('graph', Y.Base, [], {
    initializer: function (config) {
      this.set('template', new gemviz.Genre({name: "New Genre", g: config.templateG, isTemplate: true}));

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
    }
  }, {
    ATTRS: {
      container: { setter: Y.one, value: null },
      template: { setter: Y.one, value: null }
    }
  });
}, '0.1', { requires: ['base', 'dd', 'collection'] });
