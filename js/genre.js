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

YUI.add('gemviz-genre', function (Y) {
  Y.DD.DDM.set('clickPixelThresh', 0);

  var Genre = Y.Base.create('genre', Y.Base, [], {
    initializer: function (config) {
      var genre = this,
          g = this.get('g'),
          translation = g._node.transform.baseVal.getItem(0);
      g.genre = this;
      this.g = g;
      this.translation = translation;
      this.rect = g.one('rect'),
      this.text = g.one('text');

      this.after('nameChange', this.nameDidChange, this);
      this.after('originChange', this.originDidChange, this);

      // Called by Drag 'n Drop to relocate the element
      g.setXY = function (xy) {
        translation.setTranslate.apply(translation, xy);
      };
      /*
      this.dd = new Y.DD.Drag({node: g, useShim: false});
      this.dd.on('drag:mouseDown', function (evt) {
        if (evt.ev.altKey) {
          evt.preventDefault();
        }
      }, this);
      this.dd.on('drag:start', function (evt) {
        this.rect.setStyle('fill', '#CCC');
      }, this);
      this.dd.on('drag:end', function (evt) {
        // This is probably not exactly kosher
        this.set('origin', [translation.matrix.e, translation.matrix.f]);
        this.rect.setStyle('fill', '#FFF');
        if (config.template) {
          new Genre({name: config.name, origin: this.dd.actXY});
        }
      }, this);
      if (config.template)
        this.dd.plug(Y.Plugin.DDProxy, {moveOnEnd: false, cloneNode: true});
      */
      if (config.isTemplate) {
        this.dd = new Y.DD.Drag({node: g, useShim: false});
        this.dd.plug(Y.Plugin.DDProxy, {moveOnEnd: false, cloneNode: true});
        this.dd.on('drag:end', function (evt) {
          new Genre({name: config.name, origin: this.dd.actXY});
        }, this);
      } else {
        Genre.dragDelegate.createDrop(g);
      }

      this.text.on('dblclick', function (evt) {
        Y.use('gemviz-genre-editor', function (Y) {
          Y.GenreEditor.edit(genre, [evt.clientX + 15, evt.clientY + 15]);
        });
      }, this);

      if (config.origin)
        this.originDidChange({ newVal: config.origin });
      this.get('parentNode').appendChild(g);
      this.nameDidChange({newVal: config.name});

      g.on('mousedown', function (evt) {
        // Prevent text selection
        evt.preventDefault();
      }, this);

      if (! config.isTemplate)
        Genre.instances[Y.stamp(this)] = this;
    },
    destructor: function () {
      delete Genre.instances[Y.stsamp(this)];
    },
    // NB: text length and size are not available until the element is in the DOM
    nameDidChange: function (evt) {
      var text = this.text,
          bbox = text._node.getBBox();
      text.set('text', evt.newVal);
      this.rect.setAttribute('width', text._node.getComputedTextLength() + 20);
      //this.rect.setAttribute('height', Math.round(bbox.height) + 10);
    },
    originDidChange: function (evt) {
      this.g.setXY(evt.newVal);
    },
    dropHit: function (evt) {
      var source = evt.drag.get('node'),
          ourBounds = this.g._node.getClientRects()[0],
          theirBounds = source._node.getClientRects()[0],
          line = document.createElementNS("http://www.w3.org/2000/svg", "svg:line");
      line.setAttribute('x1', (ourBounds.left + ourBounds.right)/2.0);
      line.setAttribute('y1', (ourBounds.top + ourBounds.bottom)/2.0);
      line.setAttribute('x2', (theirBounds.left + theirBounds.right)/2.0);
      line.setAttribute('y2', (thierBounds.top + theirBounds.bottom)/2.0);
      line.style.stroke = "black";
      this.g.get('parentNode').insert(line, 0);
    },
    beginConnection: function () {
      var body = Y.one(document.body),
          line = document.createElementNS("http://www.w3.org/2000/svg", "svg:line"),
          ourBounds = this.g._node.getClientRects()[0],
          moveHandle;
      line.setAttribute('x1', (ourBounds.left + ourBounds.right)/2.0);
      line.setAttribute('y1', (ourBounds.top + ourBounds.bottom)/2.0);
      line.style.stroke = "black";
      this.g.get('parentNode').insertBefore(line, this.g);
      moveHandle = body.on('mousemove', function (evt) {
        line.setAttribute('x2', evt.clientX);
        line.setAttribute('y2', evt.clientY);
      }, this);
      body.once('mouseup', function (evt) {
        moveHandle.detach();
        line.parentNode.removeChild(line);
      }, this);
    },
    connectTo: function (target) {
    },
    toJSON: function () {
      return this.getAttrs(['name', 'origin']);
    }
  }, {
    ATTRS: {
      g: {
        setter: Y.one,
        valueFn: function () {
          var newG = Genre.templateG.cloneNode(true);
          newG.removeAttribute('id');
          return newG;
        }
      },
      isTemplate: { value: false },
      name: {
        validator: Y.Lang.isString,
        value: ''
      },
      origin: {
        // don't fire change events when the origin hasn't changed
        validator: function (newPoint) {
          var oldPoint = this.get('origin');
          if (oldPoint)
            return oldPoint[0] != newPoint[0] || oldPoint[1] != newPoint[1];
          else
            return Y.Lang.isNumber(newPoint[0]) && Y.Lang.isNumber(newPoint[1]);
        },
        valueFn: function () {
          if (this.translation)
            return [this.translation.matrix.e, this.translation.matrix.f];
          else
            return [0, 0];
        }
      },
      parentNode: { value: Y.one('#paper') },
      render: { value: true },
      template: { value: false }
    },
    templateG: Y.one('#genre-template'),
    instances: {},
    instanceMetadata: function () {
      var instances = Y.Object.values(this.instances);
      return Y.Array.map(instances, function (instance) {
        return instance.toJSON();
      }, this);
    }
  });
  Y.Genre = Genre;

  var dragDelegate = new Y.DD.Delegate({
    cont: '#paper',
    dragMode: 'intersect',
    nodes: '.genre',
    target: true
  });
  dragDelegate.on('drag:start', function (evt) {
    //
  });
  dragDelegate.on('drag:end', function (evt) {
    //
  });
  dragDelegate.on('drag:drophit', function (evt) {
    console.log(evt);
    alert("!!");
    //
  });
  dragDelegate.on('drag:dropmiss', function (evt) {
    var g = this.get('currentNode');
    if (g.genre.get('isTemplate')) {
      g.setXY(evt.target.startXY);
      alert('template!');
    }
  });
  Genre.dragDelegate = dragDelegate;
}, '0.1', { requires: ['base', 'dd', 'collection'] });
