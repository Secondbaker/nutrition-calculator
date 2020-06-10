const KGToLB = 2.20462262;
const CaloriesPerProteinGram = 4;
const CaloresPerFatGram = 9;
const CaloriesPerCarbohydrateGram = 4;
const RoundingFactor = 0.25;
const NaturalRoundingFactor = 1;
const ProteinPerPalm = 30.0;
const CarbohydratesPerCuppedHandfull = 35.0;
const FatPerThumb = 15.0;

//We need to get the absolute position of this script to link to adjacent files
//When document.getElementsByTagName("script") is called, this will be the last script in the array
var scripts = document.getElementsByTagName("script");
var src = scripts[scripts.length - 1].src;
//cut off this file's name so src is the name of its folder
src = src.substr(0, src.indexOf("calc-function.js"));

$(document).ready(setup);

//setup should be called when the document is ready
//it adds necessary scripts and css to the page, the inserts the calculator
function setup() {
  // Get HTML head element
  var head = document.getElementsByTagName("HEAD")[0];

  //Add my stylesheet
  var cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";
  cssLink.href = src + "nutritional-calculator-styles.css";
  head.appendChild(cssLink);

  insertCalculator();
}

function insertCalculator() {
  $(".nutritional-calculator").load(src + "calculator.html", function (data) {
    //Put the calculator in the page
    $(".nutritional-calculator").html(data);

    //Add the click function to the calculator and make it so all the inputs update it
    $("#calculate-button").click(calculate);
    $("#weight").on("input", calculate);
    $("#unit").change(calculate);

    //Resize the text in the tables using FitText
    $(".item-label").each(function () {
      $(this).fitText(1.5); //Squish more
    });
    $(".item-number").each(function () {
      $(this).fitText(0.6); //Squish less
    });
    $(".item-unit").each(function () {
      $(this).fitText(0.8);
    });
    $(".small-unit").each(function () {
      $(this).fitText(1.1);
    });
  });
}

function calculate() {
  //Grab the weight from the input
  let weight = weightToPounds(
    $("#weight").val(),
    $("#unit").children("option:selected").val()
  );

  $(".nutrition-tables")
    .children()
    .each(function fillTable() {
      let classes = $(this).attr("class");
      try {
        //first we'll figure out the calories needed
        let calories = calculateCalories(classes, weight);

        $(this)
          .find(".calories")
          .html(roundToNearest(calories, RoundingFactor));

        //next we'll figure out the protein, since it relies only on weight
        let proteinGrams = 0;
        let proteinPalms = 0;
        if (classes.includes("high-protein")) {
          proteinGrams = weight * 1.5;
        } else {
          proteinGrams = weight;
        }
        proteinPalms = proteinGrams / ProteinPerPalm;
        $(this)
          .find(".protein-grams")
          .html(roundToNearest(proteinGrams, RoundingFactor));
        $(this)
          .find(".protein-palms")
          .html(roundToNearest(proteinPalms, RoundingFactor));

        //next we'll need to get the carbohydrates
        //carbohydrates and fats will be calculated based on a percentage of what calories remain
        let fatAndCarbCalories =
          calories - proteinGrams * CaloriesPerProteinGram;
        let carbCalories = 0;
        if (classes.includes("low-carb")) {
          carbCalories = fatAndCarbCalories / 4.0;
        } else {
          carbCalories = fatAndCarbCalories / 2.0;
        }

        let carbohydratesGrams = carbCalories / CaloriesPerCarbohydrateGram;
        let carbohydratesCuppedHandfulls =
          carbohydratesGrams / CarbohydratesPerCuppedHandfull;
        $(this)
          .find(".carbohydrates-grams")
          .html(roundToNearest(carbohydratesGrams, RoundingFactor));
        $(this)
          .find(".carbohydrates-cupped-handfulls")
          .html(roundToNearest(carbohydratesCuppedHandfulls, RoundingFactor));

        //veggies are based on different things depending on which
        //diet plan we're looking at
        let veggiesFists = 0;
        if (classes.includes("low-carb")) {
          veggiesFists = carbohydratesCuppedHandfulls * 3;
        } else if (
          classes.includes("high-protein") &&
          !classes.includes("low-carb")
        ) {
          veggiesFists = carbohydratesCuppedHandfulls * 1.5;
        } else {
          veggiesFists = carbohydratesCuppedHandfulls;
        }
        $(this)
          .find(".veggies-fists")
          .html(roundToNearest(veggiesFists, RoundingFactor));

        //finally we get the fats
        let fatCalories = fatAndCarbCalories - carbCalories;
        let fatGrams = fatCalories / CaloresPerFatGram;
        let fatThumbs = fatGrams / FatPerThumb;
        $(this)
          .find(".fats-grams")
          .html(roundToNearest(fatGrams, RoundingFactor));
        $(this)
          .find(".fats-thumbs")
          .html(roundToNearest(fatThumbs, RoundingFactor));
      } catch (error) {
        //This is where we end up if classes is undefined
      }
    });
}

//returns a number rounded to nearest roundTo
function roundToNearest(number, roundTo) {
  roundTo = 1 / roundTo;

  return Math.round(number * roundTo) / roundTo;
}

//makes sure the weight unit is pounds, regardless of which unit is selected to begin with
function weightToPounds(weight, unit) {
  if (unit == "lb") {
    return weight;
  } else {
    return weight * KGToLB;
  }
}

function calculateCalories(classes, weight) {
  let calories = 0;
  if (classes.includes("maintain")) {
    calories = weight * 14.0;
  } else if (classes.includes("lose-fat")) {
    calories = weight * 12.0;
  } else if (classes.includes("gain-muscle")) {
    calories = weight * 16.0;
  }
  return calories;
}

/*global jQuery */
/*!
 * FitText.js 1.2
 *
 * Copyright 2011, Dave Rupert http://daverupert.com
 * Released under the WTFPL license
 * http://sam.zoy.org/wtfpl/
 *
 * Date: Thu May 05 14:23:00 2011 -0600
 */

(function ($) {
  $.fn.fitText = function (kompressor, options) {
    // Setup options
    var compressor = kompressor || 1,
      settings = $.extend(
        {
          minFontSize: Number.NEGATIVE_INFINITY,
          maxFontSize: Number.POSITIVE_INFINITY,
        },
        options
      );

    return this.each(function () {
      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css(
          "font-size",
          Math.max(
            Math.min(
              $this.width() / (compressor * 10),
              parseFloat(settings.maxFontSize)
            ),
            parseFloat(settings.minFontSize)
          )
        );
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on("resize.fittext orientationchange.fittext", resizer);
    });
  };
})(jQuery);
