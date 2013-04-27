/*
FloraJS-Flocking
Copyright (c) 2013 Vince Allen
vince@vinceallen.com
http://www.vinceallen.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/* Version: 1.0.0 */
/* Build time: April 27, 2013 01:02:01 */

/*global Flora, document */
Flora.Mantle.System.create(function() {

  var getRandomNumber = Flora.Utils.getRandomNumber,
      world = Flora.Mantle.System.allWorlds()[0];

  Flora.Mantle.World.update({
    gravity: new Flora.Vector(),
    c: 0
  });

  var flowField = this.add('FlowField', {
    createMarkers: false,
    resolution: 20,
    perlinSpeed: 0.015,
    perlinTime: 520
  });
  flowField.build();

  var target = this.add('Agent', {
    flowField: flowField,
    wrapEdges: true,
    mass: getRandomNumber(100, 300),
    visibility: 'hidden',
    beforeStep: function() {
      return function() {
        if (getRandomNumber(0, 1000) === 1000) {
          this.location = new Flora.Vector(getRandomNumber(0, world.bounds[1]),
              getRandomNumber(0, world.bounds[2]));
        }
      };
    }
  });

  var pl = new Flora.ColorPalette();
  switch (getRandomNumber(1, 3)) {
    case 1:
      pl.addColor({
        min: 1,
        max: 24,
        startColor: [135, 227, 26],
        endColor: [89, 165, 0]
      });
      break;

    case 2:
      pl.addColor({
        min: 1,
        max: 24,
        startColor: [237, 20, 91],
        endColor: [255, 122, 165]
      });
      break;

    case 3:
      pl.addColor({
        min: 1,
        max: 24,
        startColor: [109, 207, 246],
        endColor: [0, 118, 163]
      });
      break;
  }

  var wings = [];

  var beforeStepA = function() {
    return function() {
      this.angle = 90 + Flora.Utils.radiansToDegrees(Math.atan2(this.velocity.y, this.velocity.x));

      if (this.opacity < 1) {
        this.opacity += 0.01;
      }
    };
  };

  var beforeStepB = function() {
    return function() {
      this.flapAngle += Flora.Utils.map(this.velocity.mag(),
          this.minSpeed, this.maxSpeed, 1, 50);

      this.angle = Flora.Utils.radiansToDegrees(Math.atan2(this.velocity.y, this.velocity.x)) +
           (this.index ? this.flapAngle : -this.flapAngle);

      if (this.opacity < 1) {
        this.opacity += 0.01;
      }
    };
  };

  for (var i = 0; i < 40; i++) {

    var wingSize = getRandomNumber(8, 64),
        mass = getRandomNumber(100, 300),
        location = new Flora.Vector(world.bounds[1] / 2 + getRandomNumber(-50, 50),
          world.bounds[2] / 2 + getRandomNumber(-50, 50));

    for (var j = 0; j < 2; j++) {
      wings.push(this.add('Agent', {
        parent: j ? wings[wings.length - 1] : null,
        location: location,
        seekTarget: target,
        offsetDistance: 0,
        className: 'wing',
        pointToDirection: false,
        maxSteeringForce: 1000,
        wrapEdges: true,
        flocking: j ? true : false,
        separateStrength: 0.4,
        alignStrength: 0.1,
        cohesionStrength: 0.3,
        width: j ? wingSize : wingSize / 2,
        height: wingSize < 32 ? 1 : 2,
        color: j ? pl.getColor() : [255, 255, 255],
        opacity: 0,
        flapAngle: 0,
        mass: mass,
        index: j,
        beforeStep: j ? beforeStepA : beforeStepB
      }));
    }
  }

  // objects will flock toward mouse on click and hold
  var mousedown = false;

  Flora.Utils.addEvent(document, 'mousedown', function() {
    mousedown = true;
    Flora.Mantle.System.updateElementPropsByName('Agent', {
      seekTarget: {
        location: new Flora.Vector(Flora.Mantle.System.mouse.location.x, Flora.Mantle.System.mouse.location.y)
      }
    });
  });

  Flora.Utils.addEvent(document, 'mousemove', function() {
    if (mousedown) {
      Flora.Mantle.System.updateElementPropsByName('Agent', {
        seekTarget: {
          location: new Flora.Vector(Flora.Mantle.System.mouse.location.x, Flora.Mantle.System.mouse.location.y)
        }
      });
    }
  });

  Flora.Utils.addEvent(document, 'mouseup', function() {
    mousedown = false;
    Flora.Mantle.System.updateElementPropsByName('Agent', {
      seekTarget: target
    });
  });
});

/*Flora.System.start(function () {

  var getRandomNumber = Flora.Utils.getRandomNumber,
      universe = Flora.universe.first();

  Flora.universe.update({
    c: 0,
    gravity: new Flora.Vector()
  });

  var flowField = new Flora.FlowField({
    createMarkers: false,
    resolution: 20,
    perlinSpeed: 0.015,
    perlinTime: 520
  });
  flowField.build();

  var pl;
  switch (getRandomNumber(1, 3)) {
    case 1:
      pl = new Flora.ColorPalette();
      pl.addColor({
        min: 1,
        max: 24,
        startColor: [135, 227, 26],
        endColor: [89, 165, 0]
      });
      break;

    case 2:
      pl = new Flora.ColorPalette();
      pl.addColor({
        min: 1,
        max: 24,
        startColor: [237, 20, 91],
        endColor: [255, 122, 165]
      });
      break;

    case 3:
      pl = new Flora.ColorPalette();
      pl.addColor({
        min: 1,
        max: 24,
        startColor: [109, 207, 246],
        endColor: [0, 118, 163]
      });
      break;
  }

  var target = new Flora.Agent({
    flowField: flowField,
    wrapEdges: true,
    mass: getRandomNumber(100, 300),
    opacity: 0,
    beforeStep: function() {
      if (getRandomNumber(0, 1000) === 1000) {
        var universe = Flora.universe.first();
        this.location = new Flora.Vector(getRandomNumber(0, universe.width),
            getRandomNumber(0, universe.height));
        }
    }
  });

  var wings = [];

  var beforeStepA = function() {

    this.angle = 90 + Flora.Utils.radiansToDegrees(Math.atan2(this.velocity.y, this.velocity.x));

    if (this.opacity < 1) {
      this.opacity += 0.01;
    }
  };

  var beforeStepB = function() {

    this.flapAngle += Flora.Utils.map(this.velocity.mag(),
        this.minSpeed, this.maxSpeed, 1, 50);

    this.angle = Flora.Utils.radiansToDegrees(Math.atan2(this.velocity.y, this.velocity.x)) +
         (this.index ? this.flapAngle : -this.flapAngle);

    if (this.opacity < 1) {
      this.opacity += 0.01;
    }
  };

  for (var i = 0; i < 30; i++) {

    var wingSize = getRandomNumber(8, 64),
        mass = getRandomNumber(100, 300),
        location = new Flora.Vector(universe.width/2 + getRandomNumber(-50, 50),
          universe.height/2 + getRandomNumber(-50, 50));

    for (var j = 0; j < 2; j++) {
      wings.push(new Flora.Agent({
        parent: j ? wings[wings.length - 1] : null,
        location: location,
        seekTarget: target,
        offsetDistance: 0,
        className: 'wing',
        pointToDirection: false,
        maxSteeringForce: 1000,
        wrapEdges: true,
        flocking: j ? true : false,
        separateStrength: 0.4,
        alignStrength: 0.1,
        cohesionStrength: 0.3,
        width: j ? wingSize : wingSize / 2,
        height: wingSize < 32 ? 1 : 2,
        color: j ? pl.getColor() : [255, 255, 255],
        opacity: 0,
        flapAngle: 0,
        mass: mass,
        index: j,
        beforeStep: j ? beforeStepA : beforeStepB
      }));
    }
  }

  // objects will flock toward mouse on click and hold
  var mousedown = false;

  Flora.Utils.addEvent(document, 'mousedown', function() {
    mousedown = true;
    Flora.elementList.updatePropsByName('Agent', {
      seekTarget: {
        location: new Flora.Vector(Flora.mouse.loc.x, Flora.mouse.loc.y)
      }
    });
  });

  Flora.Utils.addEvent(document, 'mousemove', function() {
    if (mousedown) {
      Flora.elementList.updatePropsByName('Agent', {
        seekTarget: {
          location: new Flora.Vector(Flora.mouse.loc.x, Flora.mouse.loc.y)
        }
      });
    }
  });

  Flora.Utils.addEvent(document, 'mouseup', function() {
    mousedown = false;
    Flora.elementList.updatePropsByName('Agent', {
      seekTarget: target
    });
  });
});*/