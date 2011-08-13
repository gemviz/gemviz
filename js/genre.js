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

YUI.add('gemviz-genre', function (Y) {
  "use strict";

  Y.DD.DDM.set('clickPixelThresh', 0);
  
  var gemviz = Y.namespace('gemviz'),
      Genre = gemviz.Genre = Y.Base.create('genre', Y.Base, [], {
    initializer: function (config) {
      var g = this.g = config.g,
          genre = g.genre = this,
          translation = this.translation = g._node.transform.baseVal.getItem(0);
      this.rect = g.one('rect');
      this.text = g.one('text');

      this.after('nameChange', this.nameDidChange, this);
      this.after('originChange', this.originDidChange, this);

      // Called by Drag 'n Drop to relocate the element
      g.setXY = function (xy) {
        translation.setTranslate.apply(translation, xy);
      };

      this.text.on('dblclick', function (evt) {
        Y.use('gemviz-genre-editor', function (Y) {
          Y.GenreEditor.edit(genre, [evt.clientX + 15, evt.clientY + 15]);
        });
      }, this);

      if (config.origin)
        this.originDidChange({ newVal: config.origin });
      this.nameDidChange({newVal: config.name});

      g.on('mousedown', function (evt) {
        // Prevent text selection
        evt.preventDefault();
      }, this);
    },
    destructor: function () {
      this.g.remove();
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
    toJSON: function () {
      return this.getAttrs(['name', 'origin']);
    }
  }, {
    ATTRS: {
      g: {
        setter: Y.one,
      },
      name: {
        validator: Y.Lang.isString,
        value: ''
      },
      origin: {
        // don't fire change events when the origin hasn't changed
        validator: function (newPoint) {
          var oldPoint = this.get('origin');
          if (oldPoint)
            return oldPoint[0] !== newPoint[0] || oldPoint[1] !== newPoint[1];
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
      render: { value: true },
    }
  });
}, '0.1', { requires: ['base', 'dd', 'collection'] });
