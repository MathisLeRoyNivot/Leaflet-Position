// (function (global, factory) {
// 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('leaflet')) :
// 	typeof define === 'function' && define.amd ? define(['leaflet'], factory) :
// 	(factory(global.L));
// }(this, (function (L$1) { 'use strict';

// L$1 = L$1 && L$1.hasOwnProperty('default') ? L$1['default'] : L$1;

// // functional re-impl of L.Point.distanceTo,
// // with no dependency on Leaflet for easier testing
// function pointDistance(ptA, ptB) {
//     var x = ptB.x - ptA.x;
//     var y = ptB.y - ptA.y;
//     return Math.sqrt(x * x + y * y);
// }

// var computeSegmentHeading = function computeSegmentHeading(a, b) {
//     return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90 + 360) % 360;
// };

// var asRatioToPathLength = function asRatioToPathLength(_ref, totalPathLength) {
//     var value = _ref.value,
//         isInPixels = _ref.isInPixels;
//     return isInPixels ? value / totalPathLength : value;
// };

// function parseRelativeOrAbsoluteValue(value) {
//     if (typeof value === 'string' && value.indexOf('%') !== -1) {
//         return {
//             value: parseFloat(value) / 100,
//             isInPixels: false
//         };
//     }
//     var parsedValue = value ? parseFloat(value) : 0;
//     return {
//         value: parsedValue,
//         isInPixels: parsedValue > 0
//     };
// }

// var pointsEqual = function pointsEqual(a, b) {
//     return a.x === b.x && a.y === b.y;
// };

// function pointsToSegments(pts) {
//     return pts.reduce(function (segments, b, idx, points) {
//         // this test skips same adjacent points
//         if (idx > 0 && !pointsEqual(b, points[idx - 1])) {
//             var a = points[idx - 1];
//             var distA = segments.length > 0 ? segments[segments.length - 1].distB : 0;
//             var distAB = pointDistance(a, b);
//             segments.push({
//                 a: a,
//                 b: b,
//                 distA: distA,
//                 distB: distA + distAB,
//                 heading: computeSegmentHeading(a, b)
//             });
//         }
//         return segments;
//     }, []);
// }

// function projectPatternOnPointPath(pts, pattern) {
//     // 1. split the path into segment infos
//     var segments = pointsToSegments(pts);
//     var nbSegments = segments.length;
//     if (nbSegments === 0) {
//         return [];
//     }

//     var totalPathLength = segments[nbSegments - 1].distB;

//     var offset = asRatioToPathLength(pattern.offset, totalPathLength);
//     var endOffset = asRatioToPathLength(pattern.endOffset, totalPathLength);
//     var repeat = asRatioToPathLength(pattern.repeat, totalPathLength);

//     var repeatIntervalPixels = totalPathLength * repeat;
//     var startOffsetPixels = offset > 0 ? totalPathLength * offset : 0;
//     var endOffsetPixels = endOffset > 0 ? totalPathLength * endOffset : 0;

//     // 2. generate the positions of the pattern as offsets from the path start
//     var positionOffsets = [];
//     var positionOffset = startOffsetPixels;
//     do {
//         positionOffsets.push(positionOffset);
//         positionOffset += repeatIntervalPixels;
//     } while (repeatIntervalPixels > 0 && positionOffset < totalPathLength - endOffsetPixels);

//     // 3. projects offsets to segments
//     var segmentIndex = 0;
//     var segment = segments[0];
//     return positionOffsets.map(function (positionOffset) {
//         // find the segment matching the offset,
//         // starting from the previous one as offsets are ordered
//         while (positionOffset > segment.distB && segmentIndex < nbSegments - 1) {
//             segmentIndex++;
//             segment = segments[segmentIndex];
//         }

//         var segmentRatio = (positionOffset - segment.distA) / (segment.distB - segment.distA);
//         return {
//             pt: interpolateBetweenPoints(segment.a, segment.b, segmentRatio),
//             heading: segment.heading
//         };
//     });
// }

// /**
// * Finds the point which lies on the segment defined by points A and B,
// * at the given ratio of the distance from A to B, by linear interpolation.
// */
// function interpolateBetweenPoints(ptA, ptB, ratio) {
//     if (ptB.x !== ptA.x) {
//         return {
//             x: ptA.x + ratio * (ptB.x - ptA.x),
//             y: ptA.y + ratio * (ptB.y - ptA.y)
//         };
//     }
//     // special case where points lie on the same vertical axis
//     return {
//         x: ptA.x,
//         y: ptA.y + (ptB.y - ptA.y) * ratio
//     };
// }

// (function() {
//     // save these original methods before they are overwritten
//     var proto_initIcon = L.Marker.prototype._initIcon;
//     var proto_setPos = L.Marker.prototype._setPos;

//     var oldIE = (L.DomUtil.TRANSFORM === 'msTransform');

//     L.Marker.addInitHook(function () {
//         var iconOptions = this.options.icon && this.options.icon.options;
//         var iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
//         if (iconAnchor) {
//             iconAnchor = (iconAnchor[0] + 'px ' + iconAnchor[1] + 'px');
//         }
//         this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || 'center bottom' ;
//         this.options.rotationAngle = this.options.rotationAngle || 0;

//         // Ensure marker keeps rotated during dragging
//         this.on('drag', function(e) { e.target._applyRotation(); });
//     });

//     L.Marker.include({
//         _initIcon: function() {
//             proto_initIcon.call(this);
//         },

//         _setPos: function (pos) {
//             proto_setPos.call(this, pos);
//             this._applyRotation();
//         },

//         _applyRotation: function () {
//             if(this.options.rotationAngle) {
//                 this._icon.style[L.DomUtil.TRANSFORM+'Origin'] = this.options.rotationOrigin;

//                 if(oldIE) {
//                     // for IE 9, use the 2D rotation
//                     this._icon.style[L.DomUtil.TRANSFORM] = 'rotate(' + this.options.rotationAngle + 'deg)';
//                 } else {
//                     // for modern browsers, prefer the 3D accelerated version
//                     this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
//                 }
//             }
//         },

//         setRotationAngle: function(angle) {
//             this.options.rotationAngle = angle;
//             this.update();
//             return this;
//         },

//         setRotationOrigin: function(origin) {
//             this.options.rotationOrigin = origin;
//             this.update();
//             return this;
//         }
//     });
// })();

// L$1.Symbol = L$1.Symbol || {};

// /**
// * A simple dash symbol, drawn as a Polyline.
// * Can also be used for dots, if 'pixelSize' option is given the 0 value.
// */
// L$1.Symbol.Dash = L$1.Class.extend({
//     options: {
//         pixelSize: 10,
//         pathOptions: {}
//     },

//     initialize: function initialize(options) {
//         L$1.Util.setOptions(this, options);
//         this.options.pathOptions.clickable = false;
//     },

//     buildSymbol: function buildSymbol(dirPoint, latLngs, map, index, total) {
//         var opts = this.options;
//         var d2r = Math.PI / 180;

//         // for a dot, nothing more to compute
//         if (opts.pixelSize <= 1) {
//             return L$1.polyline([dirPoint.latLng, dirPoint.latLng], opts.pathOptions);
//         }

//         var midPoint = map.project(dirPoint.latLng);
//         var angle = -(dirPoint.heading - 90) * d2r;
//         var a = L$1.point(midPoint.x + opts.pixelSize * Math.cos(angle + Math.PI) / 2, midPoint.y + opts.pixelSize * Math.sin(angle) / 2);
//         // compute second point by central symmetry to avoid unecessary cos/sin
//         var b = midPoint.add(midPoint.subtract(a));
//         return L$1.polyline([map.unproject(a), map.unproject(b)], opts.pathOptions);
//     }
// });

// L$1.Symbol.dash = function (options) {
//     return new L$1.Symbol.Dash(options);
// };

// L$1.Symbol.ArrowHead = L$1.Class.extend({
//     options: {
//         polygon: true,
//         pixelSize: 10,
//         headAngle: 60,
//         pathOptions: {
//             stroke: false,
//             weight: 2
//         }
//     },

//     initialize: function initialize(options) {
//         L$1.Util.setOptions(this, options);
//         this.options.pathOptions.clickable = false;
//     },

//     buildSymbol: function buildSymbol(dirPoint, latLngs, map, index, total) {
//         return this.options.polygon ? L$1.polygon(this._buildArrowPath(dirPoint, map), this.options.pathOptions) : L$1.polyline(this._buildArrowPath(dirPoint, map), this.options.pathOptions);
//     },

//     _buildArrowPath: function _buildArrowPath(dirPoint, map) {
//         var d2r = Math.PI / 180;
//         var tipPoint = map.project(dirPoint.latLng);
//         var direction = -(dirPoint.heading - 90) * d2r;
//         var radianArrowAngle = this.options.headAngle / 2 * d2r;

//         var headAngle1 = direction + radianArrowAngle;
//         var headAngle2 = direction - radianArrowAngle;
//         var arrowHead1 = L$1.point(tipPoint.x - this.options.pixelSize * Math.cos(headAngle1), tipPoint.y + this.options.pixelSize * Math.sin(headAngle1));
//         var arrowHead2 = L$1.point(tipPoint.x - this.options.pixelSize * Math.cos(headAngle2), tipPoint.y + this.options.pixelSize * Math.sin(headAngle2));

//         return [map.unproject(arrowHead1), dirPoint.latLng, map.unproject(arrowHead2)];
//     }
// });

// L$1.Symbol.arrowHead = function (options) {
//     return new L$1.Symbol.ArrowHead(options);
// };

// L$1.Symbol.Marker = L$1.Class.extend({
//     options: {
//         markerOptions: {},
//         rotate: false
//     },

//     initialize: function initialize(options) {
//         L$1.Util.setOptions(this, options);
//         this.options.markerOptions.clickable = false;
//         this.options.markerOptions.draggable = false;
//     },

//     buildSymbol: function buildSymbol(directionPoint, latLngs, map, index, total) {
//         if (this.options.rotate) {
//             this.options.markerOptions.rotationAngle = directionPoint.heading + (this.options.angleCorrection || 0);
//         }
//         return L$1.marker(directionPoint.latLng, this.options.markerOptions);
//     }
// });

// L$1.Symbol.marker = function (options) {
//     return new L$1.Symbol.Marker(options);
// };

// var isCoord = function isCoord(c) {
//     return c instanceof L$1.LatLng || Array.isArray(c) && c.length === 2 && typeof c[0] === 'number';
// };

// var isCoordArray = function isCoordArray(ll) {
//     return Array.isArray(ll) && isCoord(ll[0]);
// };

// L$1.PolylineDecorator = L$1.FeatureGroup.extend({
//     options: {
//         patterns: []
//     },

//     initialize: function initialize(paths, options) {
//         L$1.FeatureGroup.prototype.initialize.call(this);
//         L$1.Util.setOptions(this, options);
//         this._map = null;
//         this._paths = this._initPaths(paths);
//         this._bounds = this._initBounds();
//         this._patterns = this._initPatterns(this.options.patterns);
//     },

//     /**
//     * Deals with all the different cases. input can be one of these types:
//     * array of LatLng, array of 2-number arrays, Polyline, Polygon,
//     * array of one of the previous.
//     */
//     _initPaths: function _initPaths(input, isPolygon) {
//         var _this = this;

//         if (isCoordArray(input)) {
//             // Leaflet Polygons don't need the first point to be repeated, but we do
//             var coords = isPolygon ? input.concat([input[0]]) : input;
//             return [coords];
//         }
//         if (input instanceof L$1.Polyline) {
//             // we need some recursivity to support multi-poly*
//             return this._initPaths(input.getLatLngs(), input instanceof L$1.Polygon);
//         }
//         if (Array.isArray(input)) {
//             // flatten everything, we just need coordinate lists to apply patterns
//             return input.reduce(function (flatArray, p) {
//                 return flatArray.concat(_this._initPaths(p, isPolygon));
//             }, []);
//         }
//         return [];
//     },

//     // parse pattern definitions and precompute some values
//     _initPatterns: function _initPatterns(patternDefs) {
//         return patternDefs.map(this._parsePatternDef);
//     },

//     /**
//     * Changes the patterns used by this decorator
//     * and redraws the new one.
//     */
//     setPatterns: function setPatterns(patterns) {
//         this.options.patterns = patterns;
//         this._patterns = this._initPatterns(this.options.patterns);
//         this.redraw();
//     },

//     /**
//     * Changes the patterns used by this decorator
//     * and redraws the new one.
//     */
//     setPaths: function setPaths(paths) {
//         this._paths = this._initPaths(paths);
//         this._bounds = this._initBounds();
//         this.redraw();
//     },

//     /**
//     * Parse the pattern definition
//     */
//     _parsePatternDef: function _parsePatternDef(patternDef, latLngs) {
//         return {
//             symbolFactory: patternDef.symbol,
//             // Parse offset and repeat values, managing the two cases:
//             // absolute (in pixels) or relative (in percentage of the polyline length)
//             offset: parseRelativeOrAbsoluteValue(patternDef.offset),
//             endOffset: parseRelativeOrAbsoluteValue(patternDef.endOffset),
//             repeat: parseRelativeOrAbsoluteValue(patternDef.repeat)
//         };
//     },

//     onAdd: function onAdd(map) {
//         this._map = map;
//         this._draw();
//         this._map.on('moveend', this.redraw, this);
//     },

//     onRemove: function onRemove(map) {
//         this._map.off('moveend', this.redraw, this);
//         this._map = null;
//         L$1.FeatureGroup.prototype.onRemove.call(this, map);
//     },

//     /**
//     * As real pattern bounds depends on map zoom and bounds,
//     * we just compute the total bounds of all paths decorated by this instance.
//     */
//     _initBounds: function _initBounds() {
//         var allPathCoords = this._paths.reduce(function (acc, path) {
//             return acc.concat(path);
//         }, []);
//         return L$1.latLngBounds(allPathCoords);
//     },

//     getBounds: function getBounds() {
//         return this._bounds;
//     },

//     /**
//     * Returns an array of ILayers object
//     */
//     _buildSymbols: function _buildSymbols(latLngs, symbolFactory, directionPoints) {
//         var _this2 = this;

//         return directionPoints.map(function (directionPoint, i) {
//             return symbolFactory.buildSymbol(directionPoint, latLngs, _this2._map, i, directionPoints.length);
//         });
//     },

//     /**
//     * Compute pairs of LatLng and heading angle,
//     * that define positions and directions of the symbols on the path
//     */
//     _getDirectionPoints: function _getDirectionPoints(latLngs, pattern) {
//         var _this3 = this;

//         if (latLngs.length < 2) {
//             return [];
//         }
//         var pathAsPoints = latLngs.map(function (latLng) {
//             return _this3._map.project(latLng);
//         });
//         return projectPatternOnPointPath(pathAsPoints, pattern).map(function (point) {
//             return {
//                 latLng: _this3._map.unproject(L$1.point(point.pt)),
//                 heading: point.heading
//             };
//         });
//     },

//     redraw: function redraw() {
//         if (!this._map) {
//             return;
//         }
//         this.clearLayers();
//         this._draw();
//     },

//     /**
//     * Returns all symbols for a given pattern as an array of FeatureGroup
//     */
//     _getPatternLayers: function _getPatternLayers(pattern) {
//         var _this4 = this;

//         var mapBounds = this._map.getBounds().pad(0.1);
//         return this._paths.map(function (path) {
//             var directionPoints = _this4._getDirectionPoints(path, pattern)
//             // filter out invisible points
//             .filter(function (point) {
//                 return mapBounds.contains(point.latLng);
//             });
//             return L$1.featureGroup(_this4._buildSymbols(path, pattern.symbolFactory, directionPoints));
//         });
//     },

//     /**
//     * Draw all patterns
//     */
//     _draw: function _draw() {
//         var _this5 = this;

//         this._patterns.map(function (pattern) {
//             return _this5._getPatternLayers(pattern);
//         }).forEach(function (layers) {
//             _this5.addLayer(L$1.featureGroup(layers));
//         });
//     }
// });
// /*
//  * Allows compact syntax to be used
//  */
// L$1.polylineDecorator = function (paths, options) {
//     return new L$1.PolylineDecorator(paths, options);
// };

// })));



//-------- Leaflet.PolylineDecorator.js -------------------------------------------
L.LineUtil.PolylineDecorator = {
    computeAngle: function(a, b) {
      return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI) + 90;
    },

    getPointPathPixelLength: function(pts) {
      var nbPts = pts.length;
      if (nbPts < 2) {
        return 0;
      }
      var dist = 0,
        prevPt = pts[0],
        pt;
      for (var i = 1; i < nbPts; i++) {
        dist += prevPt.distanceTo(pt = pts[i]);
        prevPt = pt;
      }
      return dist;
    },

    getPixelLength: function(pl, map) {
      var ll = (pl instanceof L.Polyline) ? pl.getLatLngs() : pl,
        nbPts = ll.length;
      if (nbPts < 2) {
        return 0;
      }
      var dist = 0,
        prevPt = map.project(ll[0]),
        pt;
      for (var i = 1; i < nbPts; i++) {
        dist += prevPt.distanceTo(pt = map.project(ll[i]));
        prevPt = pt;
      }
      return dist;
    },

    /**
     * path: array of L.LatLng
     * offsetRatio: the ratio of the total pixel length where the pattern will start
     * endOffsetRatio: the ratio of the total pixel length where the pattern will end
     * repeatRatio: the ratio of the total pixel length between two points of the pattern 
     * map: the map, to access the current projection state
     */
    projectPatternOnPath: function(path, offsetRatio, endOffsetRatio, repeatRatio, map) {
      var pathAsPoints = [],
        i;

      for (i = 0, l = path.length; i < l; i++) {
        pathAsPoints[i] = map.project(path[i]);
      }
      // project the pattern as pixel points
      var pattern = this.projectPatternOnPointPath(pathAsPoints, offsetRatio, endOffsetRatio, repeatRatio);
      // and convert it to latlngs;
      for (i = 0, l = pattern.length; i < l; i++) {
        pattern[i].latLng = map.unproject(pattern[i].pt);
      }
      return pattern;
    },

    projectPatternOnPointPath: function(pts, offsetRatio, endOffsetRatio, repeatRatio) {
      var positions = [];
      // 1. compute the absolute interval length in pixels
      var repeatIntervalLength = this.getPointPathPixelLength(pts) * repeatRatio;
      // 2. find the starting point by using the offsetRatio and find the last pixel using endOffsetRatio
      var previous = this.interpolateOnPointPath(pts, offsetRatio);
      var endOffsetPixels = endOffsetRatio > 0 ? this.getPointPathPixelLength(pts) * endOffsetRatio : 0;

      positions.push(previous);
      if (repeatRatio > 0) {
        // 3. consider only the rest of the path, starting at the previous point
        var remainingPath = pts;
        remainingPath = remainingPath.slice(previous.predecessor);

        remainingPath[0] = previous.pt;
        var remainingLength = this.getPointPathPixelLength(remainingPath);

        // 4. project as a ratio of the remaining length,
        // and repeat while there is room for another point of the pattern

        while (repeatIntervalLength <= remainingLength - endOffsetPixels) {
          previous = this.interpolateOnPointPath(remainingPath, repeatIntervalLength / remainingLength);
          positions.push(previous);
          remainingPath = remainingPath.slice(previous.predecessor);
          remainingPath[0] = previous.pt;
          remainingLength = this.getPointPathPixelLength(remainingPath);
        }
      }
      return positions;
    },

    /**
     * pts: array of L.Point
     * ratio: the ratio of the total length where the point should be computed
     * Returns null if ll has less than 2 LatLng, or an object with the following properties:
     *    latLng: the LatLng of the interpolated point
     *    predecessor: the index of the previous vertex on the path
     *    heading: the heading of the path at this point, in degrees
     */
    interpolateOnPointPath: function(pts, ratio) {
      var nbVertices = pts.length;

      if (nbVertices < 2) {
        return null;
      }
      // easy limit cases: ratio negative/zero => first vertex
      if (ratio <= 0) {
        return {
          pt: pts[0],
          predecessor: 0,
          heading: this.computeAngle(pts[0], pts[1])
        };
      }
      // ratio >=1 => last vertex
      if (ratio >= 1) {
        return {
          pt: pts[nbVertices - 1],
          predecessor: nbVertices - 1,
          heading: this.computeAngle(pts[nbVertices - 2], pts[nbVertices - 1])
        };
      }
      // 1-segment-only path => direct linear interpolation
      if (nbVertices == 2) {
        return {
          pt: this.interpolateBetweenPoints(pts[0], pts[1], ratio),
          predecessor: 0,
          heading: this.computeAngle(pts[0], pts[1])
        };
      }

      var pathLength = this.getPointPathPixelLength(pts);
      var a = pts[0],
        b = a,
        ratioA = 0,
        ratioB = 0,
        distB = 0;
      // follow the path segments until we find the one
      // on which the point must lie => [ab] 
      var i = 1;
      for (; i < nbVertices && ratioB < ratio; i++) {
        a = b;
        ratioA = ratioB;
        b = pts[i];
        distB += a.distanceTo(b);
        ratioB = distB / pathLength;
      }

      // compute the ratio relative to the segment [ab]
      var segmentRatio = (ratio - ratioA) / (ratioB - ratioA);

      return {
        pt: this.interpolateBetweenPoints(a, b, segmentRatio),
        predecessor: i - 2,
        heading: this.computeAngle(a, b)
      };
    },

    /**
     * Finds the point which lies on the segment defined by points A and B,
     * at the given ratio of the distance from A to B, by linear interpolation. 
     */
    interpolateBetweenPoints: function(ptA, ptB, ratio) {
      if (ptB.x != ptA.x) {
        return new L.Point(
          (ptA.x * (1 - ratio)) + (ratio * ptB.x),
          (ptA.y * (1 - ratio)) + (ratio * ptB.y)
        );
      }
      // special case where points lie on the same vertical axis
      return new L.Point(ptA.x, ptA.y + (ptB.y - ptA.y) * ratio);
    }
  };

  L.PolylineDecorator = L.FeatureGroup.extend({
    options: {
      patterns: []
    },

    initialize: function(paths, options) {
      L.FeatureGroup.prototype.initialize.call(this);
      L.Util.setOptions(this, options);
      this._map = null;
      this._initPaths(paths);
      this._initPatterns();
    },

    /**
     * Deals with all the different cases. p can be one of these types:
     * array of LatLng, array of 2-number arrays, Polyline, Polygon,
     * array of one of the previous.
     */
    _initPaths: function(p) {
      this._paths = [];
      var isPolygon = false;
      if (p instanceof L.Polyline) {
        this._initPath(p.getLatLngs(), (p instanceof L.Polygon));
      } else if (L.Util.isArray(p) && p.length > 0) {
        if (p[0] instanceof L.Polyline) {
          for (var i = 0; i < p.length; i++) {
            this._initPath(p[i].getLatLngs(), (p[i] instanceof L.Polygon));
          }
        } else {
          this._initPath(p);
        }
      }
    },

    _isCoordArray: function(ll) {
      return (L.Util.isArray(ll) && ll.length > 0 && (
        ll[0] instanceof L.LatLng ||
        (L.Util.isArray(ll[0]) && ll[0].length == 2 && typeof ll[0][0] === 'number')
      ));
    },

    _initPath: function(path, isPolygon) {
      var latLngs;
      // It may still be an array of array of coordinates
      // (ex: polygon with rings)
      if (this._isCoordArray(path)) {
        latLngs = [path];
      } else {
        latLngs = path;
      }
      for (var i = 0; i < latLngs.length; i++) {
        // As of Leaflet >= v0.6, last polygon vertex (=first) isn't repeated.
        // Our algorithm needs it, so we add it back explicitly.
        if (isPolygon) {
          latLngs[i].push(latLngs[i][0]);
        }
        this._paths.push(latLngs[i]);
      }
    },

    _initPatterns: function() {
      this._isZoomDependant = false;
      this._patterns = [];
      var pattern;
      // parse pattern definitions and precompute some values
      for (var i = 0; i < this.options.patterns.length; i++) {
        pattern = this._parsePatternDef(this.options.patterns[i]);
        this._patterns.push(pattern);
        // determines if we have to recompute the pattern on each zoom change
        this._isZoomDependant = this._isZoomDependant ||
          pattern.isOffsetInPixels ||
          pattern.isEndOffsetInPixels ||
          pattern.isRepeatInPixels ||
          pattern.symbolFactory.isZoomDependant;
      }
    },

    /**
     * Changes the patterns used by this decorator
     * and redraws the new one.
     */
    setPatterns: function(patterns) {
      this.options.patterns = patterns;
      this._initPatterns();
      this._softRedraw();
    },

    /**
     * Changes the patterns used by this decorator
     * and redraws the new one.
     */
    setPaths: function(paths) {
      this._initPaths(paths);
      this.redraw();
    },

    /**
     * Parse the pattern definition
     */
    _parsePatternDef: function(patternDef, latLngs) {
      var pattern = {
        cache: [],
        symbolFactory: patternDef.symbol,
        isOffsetInPixels: false,
        isEndOffsetInPixels: false,
        isRepeatInPixels: false
      };

      // Parse offset and repeat values, managing the two cases:
      // absolute (in pixels) or relative (in percentage of the polyline length)
      if (typeof patternDef.offset === 'string' && patternDef.offset.indexOf('%') != -1) {
        pattern.offset = parseFloat(patternDef.offset) / 100;
      } else {
        pattern.offset = patternDef.offset ? parseFloat(patternDef.offset) : 0;
        pattern.isOffsetInPixels = (pattern.offset > 0);
      }

      if (typeof patternDef.endOffset === 'string' && patternDef.endOffset.indexOf('%') != -1) {
        pattern.endOffset = parseFloat(patternDef.endOffset) / 100;
      } else {
        pattern.endOffset = patternDef.endOffset ? parseFloat(patternDef.endOffset) : 0;
        pattern.isEndOffsetInPixels = (pattern.endOffset > 0);
      }

      if (typeof patternDef.repeat === 'string' && patternDef.repeat.indexOf('%') != -1) {
        pattern.repeat = parseFloat(patternDef.repeat) / 100;
      } else {
        pattern.repeat = parseFloat(patternDef.repeat);
        pattern.isRepeatInPixels = (pattern.repeat > 0);
      }

      return (pattern);
    },

    onAdd: function(map) {
      this._map = map;
      this._draw();
      // listen to zoom changes to redraw pixel-spaced patterns
      if (this._isZoomDependant) {
        this._map.on('zoomend', this._softRedraw, this);
      }
    },

    onRemove: function(map) {
      // remove optional map zoom listener
      this._map.off('zoomend', this._softRedraw, this);
      this._map = null;
      L.LayerGroup.prototype.onRemove.call(this, map);
    },

    /**
     * Returns an array of ILayers object
     */
    _buildSymbols: function(latLngs, symbolFactory, directionPoints) {
      var symbols = [];
      for (var i = 0, l = directionPoints.length; i < l; i++) {
        symbols.push(symbolFactory.buildSymbol(directionPoints[i], latLngs, this._map, i, l));
      }
      return symbols;
    },

    _getCache: function(pattern, zoom, pathIndex) {
      var zoomCache = pattern.cache[zoom];
      if (typeof zoomCache === 'undefined') {
        pattern.cache[zoom] = [];
        return null;
      }
      return zoomCache[pathIndex];
    },

    /**
     * Select pairs of LatLng and heading angle,
     * that define positions and directions of the symbols
     * on the path
     */
    _getDirectionPoints: function(pathIndex, pattern) {
      var zoom = this._map.getZoom();
      var dirPoints = this._getCache(pattern, zoom, pathIndex);
      if (dirPoints) {
        return dirPoints;
      }

      var offset, endOffset, repeat, pathPixelLength = null,
        latLngs = this._paths[pathIndex];
      if (pattern.isOffsetInPixels) {
        pathPixelLength = L.LineUtil.PolylineDecorator.getPixelLength(latLngs, this._map);
        offset = pattern.offset / pathPixelLength;
      } else {
        offset = pattern.offset;
      }
      if (pattern.isEndOffsetInPixels) {
        pathPixelLength = (pathPixelLength !== null) ? pathPixelLength : L.LineUtil.PolylineDecorator.getPixelLength(latLngs, this._map);
        endOffset = pattern.endOffset / pathPixelLength;
      } else {
        endOffset = pattern.endOffset;
      }
      if (pattern.isRepeatInPixels) {
        pathPixelLength = (pathPixelLength !== null) ? pathPixelLength : L.LineUtil.PolylineDecorator.getPixelLength(latLngs, this._map);
        repeat = pattern.repeat / pathPixelLength;
      } else {
        repeat = pattern.repeat;
      }
      dirPoints = L.LineUtil.PolylineDecorator.projectPatternOnPath(latLngs, offset, endOffset, repeat, this._map);
      // save in cache to avoid recomputing this
      pattern.cache[zoom][pathIndex] = dirPoints;

      return dirPoints;
    },

    /**
     * Public redraw, invalidating the cache.
     */
    redraw: function() {
      this._redraw(true);
    },

    /**
     * "Soft" redraw, called internally for example on zoom changes,
     * keeping the cache.
     */
    _softRedraw: function() {
      this._redraw(false);
    },

    _redraw: function(clearCache) {
      if (this._map === null)
        return;
      this.clearLayers();
      if (clearCache) {
        for (var i = 0; i < this._patterns.length; i++) {
          this._patterns[i].cache = [];
        }
      }
      this._draw();
    },

    /**
     * Draw a single pattern
     */
    _drawPattern: function(pattern) {
      var directionPoints, symbols;
      for (var i = 0; i < this._paths.length; i++) {
        directionPoints = this._getDirectionPoints(i, pattern);
        symbols = this._buildSymbols(this._paths[i], pattern.symbolFactory, directionPoints);
        for (var j = 0; j < symbols.length; j++) {
          this.addLayer(symbols[j]);
        }
      }
    },

    /**
     * Draw all patterns
     */
    _draw: function() {
      for (var i = 0; i < this._patterns.length; i++) {
        this._drawPattern(this._patterns[i]);
      }
    }
  });
  /*
   * Allows compact syntax to be used
   */
  L.polylineDecorator = function(paths, options) {
    return new L.PolylineDecorator(paths, options);
  };

  L.RotatedMarker = L.Marker.extend({
    options: {
      angle: 0
    },

    statics: {
      TRANSFORM_ORIGIN: L.DomUtil.testProp(
        ['transformOrigin', 'WebkitTransformOrigin', 'OTransformOrigin', 'MozTransformOrigin', 'msTransformOrigin'])
    },

    _initIcon: function() {
      L.Marker.prototype._initIcon.call(this);

      this._icon.style[L.RotatedMarker.TRANSFORM_ORIGIN] = this._getTransformOrigin();
    },

    _getTransformOrigin: function() {
      var iconAnchor = this.options.icon.options.iconAnchor;

      if (!iconAnchor) {
        return '50% 50%';
      }

      return iconAnchor[0] + 'px ' + iconAnchor[1] + 'px';
    },

    _setPos: function(pos) {
      L.Marker.prototype._setPos.call(this, pos);

      if (L.DomUtil.TRANSFORM) {
        // use the CSS transform rule if available
        this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
      } else if (L.Browser.ie) {
        // fallback for IE6, IE7, IE8
        var rad = this.options.angle * (Math.PI / 180),
          costheta = Math.cos(rad),
          sintheta = Math.sin(rad);
        this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
          costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
      }
    },

    setAngle: function(ang) {
      this.options.angle = ang;
    }
  });

  L.rotatedMarker = function(pos, options) {
    return new L.RotatedMarker(pos, options);
  };

  /**
   * Defines several classes of symbol factories,
   * to be used with L.PolylineDecorator
   */

  L.Symbol = L.Symbol || {};

  /**
   * A simple dash symbol, drawn as a Polyline.
   * Can also be used for dots, if 'pixelSize' option is given the 0 value.
   */
  L.Symbol.Dash = L.Class.extend({
    isZoomDependant: true,

    options: {
      pixelSize: 10,
      pathOptions: {}
    },

    initialize: function(options) {
      L.Util.setOptions(this, options);
      this.options.pathOptions.clickable = false;
    },

    buildSymbol: function(dirPoint, latLngs, map, index, total) {
      var opts = this.options,
        d2r = Math.PI / 180;

      // for a dot, nothing more to compute
      if (opts.pixelSize <= 1) {
        return new L.Polyline([dirPoint.latLng, dirPoint.latLng], opts.pathOptions);
      }

      var midPoint = map.project(dirPoint.latLng);
      var angle = (-(dirPoint.heading - 90)) * d2r;
      var a = new L.Point(
        midPoint.x + opts.pixelSize * Math.cos(angle + Math.PI) / 2,
        midPoint.y + opts.pixelSize * Math.sin(angle) / 2
      );
      // compute second point by central symmetry to avoid unecessary cos/sin
      var b = midPoint.add(midPoint.subtract(a));
      return new L.Polyline([map.unproject(a), map.unproject(b)], opts.pathOptions);
    }
  });

  L.Symbol.dash = function(options) {
    return new L.Symbol.Dash(options);
  };

  L.Symbol.ArrowHead = L.Class.extend({
    isZoomDependant: true,

    options: {
      polygon: true,
      pixelSize: 10,
      headAngle: 60,
      pathOptions: {
        stroke: false,
        weight: 2
      }
    },

    initialize: function(options) {
      L.Util.setOptions(this, options);
      this.options.pathOptions.clickable = false;
    },

    buildSymbol: function(dirPoint, latLngs, map, index, total) {
      var opts = this.options;
      var path;
      if (opts.polygon) {
        path = new L.Polygon(this._buildArrowPath(dirPoint, map), opts.pathOptions);
      } else {
        path = new L.Polyline(this._buildArrowPath(dirPoint, map), opts.pathOptions);
      }
      return path;
    },

    _buildArrowPath: function(dirPoint, map) {
      var d2r = Math.PI / 180;
      var tipPoint = map.project(dirPoint.latLng);
      var direction = (-(dirPoint.heading - 90)) * d2r;
      var radianArrowAngle = this.options.headAngle / 2 * d2r;

      var headAngle1 = direction + radianArrowAngle,
        headAngle2 = direction - radianArrowAngle;
      var arrowHead1 = new L.Point(
          tipPoint.x - this.options.pixelSize * Math.cos(headAngle1),
          tipPoint.y + this.options.pixelSize * Math.sin(headAngle1)),
        arrowHead2 = new L.Point(
          tipPoint.x - this.options.pixelSize * Math.cos(headAngle2),
          tipPoint.y + this.options.pixelSize * Math.sin(headAngle2));

      return [
        map.unproject(arrowHead1),
        dirPoint.latLng,
        map.unproject(arrowHead2)
      ];
    }
  });

  L.Symbol.arrowHead = function(options) {
    return new L.Symbol.ArrowHead(options);
  };

  L.Symbol.Marker = L.Class.extend({
    isZoomDependant: false,

    options: {
      markerOptions: {},
      rotate: false
    },

    initialize: function(options) {
      L.Util.setOptions(this, options);
      this.options.markerOptions.clickable = false;
      this.options.markerOptions.draggable = false;
      this.isZoomDependant = (L.Browser.ie && this.options.rotate);
    },

    buildSymbol: function(directionPoint, latLngs, map, index, total) {
      if (!this.options.rotate) {
        return new L.Marker(directionPoint.latLng, this.options.markerOptions);
      } else {
        this.options.markerOptions.angle = directionPoint.heading + (this.options.angleCorrection || 0);
        return new L.RotatedMarker(directionPoint.latLng, this.options.markerOptions);
      }
    }
  });

  L.Symbol.marker = function(options) {
    return new L.Symbol.Marker(options);
  };


  //---------------------------------------------------------

//   window.map = L.map('map').setView([3.14, 15.92], 17);

//   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//   }).addTo(window.map);

//   window.createPolyline = function createPolyline() {
  
//     var lng = 15.92;
//     var latFrom = -10;
//     var latTo = 10;
//     var latCount = 10;
//     var deltaLat = (latTo - latFrom) / latCount;

//     var latlng_list = [];
//     for (var i = 0; i < latCount; i++) {
//       latlng_list.push({
//         lat: latFrom + deltaLat * i,
//         lng: lng
//       });

//     }

//     var poly = L.polyline(latlng_list, {
//       color: "#FF0000"
//     }).addTo(window.map);
  
//   var t0 = window.performance.now();
//     var decorator = L.polylineDecorator(poly, {
//       patterns: [{
//         offset: 0,
//         repeat: 100,
//         symbol: L.Symbol.marker({
//           rotate: true,
//           markerOptions: {
//             icon: L.icon({
//               iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARklEQVQ4je2MsQkAIAzAsujkQz6tOOldXuDSgji1gpuBjAl8npPF63iK7onGTXRNNK5AAKJ3MoAisaKTbhmkI94nyTL4OFnUkQ0+s+d2LAAAAABJRU5ErkJggg==',
//               iconAnchor: [5, 4]
//             })
//           }
//         })
//       }]
//     }).addTo(window.map);
//   var t1 = window.performance.now();
//   alert("L.polylineDecorator(): " + (t1 - t0) + "ms");
 
//   var t2 = window.performance.now();
//   var bounds = poly.getBounds();
//   var t3 = window.performance.now();
//   alert("poly.getBounds(): " + (t3 - t2) + "ms");
  
//   var t4 = window.performance.now();
//       window.map.fitBounds(bounds);
//   var t5 = window.performance.now();
//   alert("poly.fitBounds(): " + (t5 - t4) + "ms");
  
//   //alert('createPolyline() done');
  
//   }
