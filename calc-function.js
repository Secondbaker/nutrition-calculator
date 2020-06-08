const KGToLB = 2.20462262;
const CaloriesPerProteinGram = 4;
const CaloresPerFatGram = 9;
const CaloriesPerCarbohydrateGram = 4;
const RoundingFactor = .25;

$(document).ready(insertCalculator);

function insertCalculator() {
    $('.nutritional-calculator').load("/calculator.html", function(data) {
        //Put the calculator in the page
        $(".nutritional-calculator").html(data);
        //Add the click function to the calculator
        $('#calculate-button').click(calculate);
        $('#weight').on('input', calculate);
        $('#unit').change(calculate);
    }); 
}

function calculate ()
{
    
        console.log("clicked");
        let weight = weightToPounds($('#weight').val(), $('#unit').children("option:selected").val());
    
        $('#nutrition-tables').children().each(function fillTable() {
            let classes = $(this).attr('class');
            try
            {
                //first we'll figure out the calories needed
                let calories = 0;
                if(classes.includes('maintain'))
                {
                    calories = weight * 14;
                }
                else if(classes.includes('lose-fat'))
                {
                    calories = weight * 12;
                }
                else if(classes.includes('gain-muscle'))
                {
                    calories = weight * 16;
                }
                $(this).find('.calories').html(roundToNearest(calories, RoundingFactor));
    
                //next we'll figure out the protein, since it relies only on weight
                let proteinGrams = 0;
                let proteinPalms = 0;
                if(classes.includes('high-protein'))
                {
                    proteinGrams = weight * 1.5;
                }
                else
                {
                    proteinGrams = weight;
                }
                proteinPalms = proteinGrams / 30;
                $(this).find('.protein-grams').html(roundToNearest(proteinGrams, RoundingFactor));
                $(this).find('.protein-palms').html(proteinPalms);
    
                //next we'll need to get the carbohydrates
                //carbohydrates and fats will be calculated based on a percentage of what calories remain
                let fatAndCarbCalories = calories - (proteinGrams * CaloriesPerProteinGram);
                console.log(fatAndCarbCalories);
                let carbCalories = 0;
                if(classes.includes('low-carb'))
                {
                    carbCalories = fatAndCarbCalories / 4;
                }
                else
                {
                    carbCalories = fatAndCarbCalories / 2;
                }
    
                let carbohydratesGrams = carbCalories / CaloriesPerCarbohydrateGram;
                let carbohydratesCuppedHandfulls = Math.round(carbohydratesGrams / 35);
                $(this).find('.carbohydrates-grams').html(carbohydratesGrams);
                $(this).find('.carbohydrates-cupped-handfulls').html(carbohydratesCuppedHandfulls);
    
                //veggies are based on different things depending on which
                //diet plan we're looking at
                let veggiesFists = 0;
                if(classes.includes('low-carb'))
                {
                    veggiesFists = carbohydratesCuppedHandfulls * 3;
                }
                else if(classes.includes('high-protein') && !classes.includes('low-carb'))
                {
                    veggiesFists = carbohydratesCuppedHandfulls * 1.5;
                }
                else
                {
                    veggiesFists = carbohydratesCuppedHandfulls;
                }
                $(this).find('.veggies-fists').html(veggiesFists);

                //finally we get the fats
                let fatCalories = fatAndCarbCalories - carbCalories;
                let fatGrams = fatCalories / CaloresPerFatGram;
                let fatThumbs = fatGrams / 15;
                $(this).find('.fats-grams').html(fatGrams);
                $(this).find('.fats-thumbs').html(fatThumbs);
            }
            catch(error)
            {
                //This is where we end up if classes is undefined
            }
        });
    
    
}

//returns a number rounded to nearest roundTo
function roundToNearest (number, roundTo)
{
    roundTo = 1 / roundTo;

    return Math.round(number * roundTo) / roundTo;
}

//makes sure the weight unit is pounds, regardless of which unit is selected to begin with
function weightToPounds (weight, unit)
{
    console.log(weight);
    console.log(unit);
    if(unit == "lb")
    {
        return weight;
    }
    else
    {
        return weight * KGToLB;
    }
}
//takes a weight in pounds and returns the normal amount of protein for that weight
function normalProtein (weight)
{
    return weight;
}
//takes an amount of protein in grams and returns that amount in palms
function proteinToPalms (protein)
{
    return protein / 30;
}