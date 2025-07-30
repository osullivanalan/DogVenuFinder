const Crawlee = require('crawlee');
const { log, KeyValueStore,  } = Crawlee;
const { Actor } = require('apify');

Actor.main(async () => {
    // Your code here
    const tempKvStore = await KeyValueStore.open('temp');
    const dogSearch = await tempKvStore.getValue('cleaned_dog_search_results');
    var dogResults = []


    for (var result of dogSearch) {
        let isDogFriendly = false;

        let formattedResult = {
            Name: result.title,
            Address: result.address,
            ZipCode: result.postalCode,
            Type: result.categoryName,
            OutDoorOnly: false,
            Info: result.reviewsTags.map(x => x.title).join(', '),
            Link: result.website,
            State: result.state,
            Latitude: result.location.lat,
            Longitude: result.location.lng,
            Phone: result.phone,
            Rating: result.totalScore,
            GooglePlaceId: result.placeId,
        }

        try {
            formattedResult.Hours = transformHours(result.openingHours).Hours;
        } catch (e) {
            log.error(`Error transforming hours for ${result.title}: ${e.message}`);
            formattedResult.Hours = { Hours: {} };
        }

        log.info(`Processing result: ${result.title}`);

        let petInfo = result.additionalInfo?.Pets;
        if (petInfo) {
            log.info(`Pet info found`);
            for (let info of petInfo) {
                if (info["Dogs allowed"] == true) {
                    isDogFriendly = true;
                }
                if (info["Dogs allowed inside"] == true) {
                    isDogFriendly = true;
                    formattedResult.Inside = true;
                    formattedResult.OutDoorOnly = false;
                }
                if (info["Dogs allowed outside"] == true) {
                    isDogFriendly = true;
                    formattedResult.Outside = true;
                }
            }
        }

        for (var reviewTag of result.reviewsTags) {
            //log.info(`Review Tag: ${reviewTag}`);
            if (reviewTag.title.toLowerCase().includes('dog')) {
                isDogFriendly = true;
                log.info(`Found dog-friendly tag in review: ${reviewTag}`);
            }
        }

        for (var question of result.questionsAndAnswers) {
            log.info(`Question: ${question.question}`);
            if (question.question.toLowerCase().includes('dog') || question.question.toLowerCase().includes('pet')) {
                for (var answer of question.answers) {
                    let answerText = answer.answer.toLowerCase();
                    log.info(`Answer: ${answerText}`);

                    if (answerText.includes('yes')) {
                        isDogFriendly = true;
                    }
                    if (answerText.includes('out') || answerText.includes('garden') || answerText.includes('outside') || answerText.includes('terrace')) {
                        isDogFriendly = true;
                        formattedResult.OutDoorOnly = true;
                        log.info(`Found dog-friendly answer outside: ${answerText}`);
                    }
                }
            }
        }

        if (result.updatesFromCustomers?.text) {
            if (result.updatesFromCustomers.text.toLowerCase().includes('dog')) {
                isDogFriendly = true;
                log.info(`Found dog-friendly update: ${result.updatesFromCustomers.text}`);
            }

        }

        if (result.description?.toLowerCase().includes('dog')) {
            isDogFriendly = true;
            log.info(`Found dog-friendly description: ${result.description}`);
        }

        if (isDogFriendly) {

            //infer if it's outdoor only
            if(formattedResult.Outside && !formattedResult.Inside) {
                formattedResult.OutDoorOnly = true;
            }

            dogResults.push(formattedResult);
            log.info(`Added dog-friendly result: ${result.title}`);
        }
    }

    const existing = await tempKvStore.getValue('locations');
    //add existing to the dogResults if they are not there based on ZipCode only
    if (existing) {
        for (const loc of existing) {
            if (!dogResults.some(dog => dog.ZipCode === loc.ZipCode)) {
                loc.State = loc.Location;
                delete loc.Location; // Remove Location field if it exists
                dogResults.push(loc);
                log.info(`Added existing location: ${loc.Name} with ZipCode: ${loc.ZipCode}`);
            }
        }
    }


    await tempKvStore.setValue('dog_friendly', dogResults);

    log.info(`Found ${dogResults.length} dog-friendly results.`);


});


function toMilitaryTime(time) {
    // Supports: '12', '12:30', '12 PM', '12:30 PM'
    const [_, h, m, ampm] = time.trim().match(/^([0-9]{1,2})(?::([0-9]{2}))?\s*(AM|PM)?$/i) || [];
    if (!_)
        return null;

    let hour = parseInt(h, 10);
    let min = parseInt(m || '0', 10);

    if (ampm) {
        if (ampm.toUpperCase() === 'AM') {
            if (hour === 12) hour = 0;
        } else if (ampm.toUpperCase() === 'PM') {
            if (hour !== 12) hour += 12;
        }
    }
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Handles "12:30 to 15:30, 17:00 to 21:00" or "12 to 11 PM"
function rangeToMilitary(hours) {
    if (hours.toLowerCase().includes('closed')) {
        return "Closed";
    }
    if (hours.toLowerCase().includes('open')) {
        return "00:00 - 23:59";
    }
    return hours.split(',').map(range => {
        const [start, end] = range.split('to').map(t => t.trim());
        // If start has no AM/PM, borrow from end
        let s = start, e = end;
        if (!/AM|PM/i.test(s) && /AM|PM/i.test(e)) {
            s = s + ' ' + (e.match(/AM|PM/i)[0]);
        }
        return `${toMilitaryTime(s)} - ${toMilitaryTime(e)}`;
    }).join(', ');
}

function groupDays(openingHours) {
    // Map day to short for output
    const dayShort = d => d.slice(0, 3);

    // Map through and accumulate groups
    let result = {};
    let current = { days: [], hours: null };

    for (let entry of openingHours) {
        if (!current.hours) {
            current.hours = entry.hours;
            current.days.push(entry.day);
        } else if (entry.hours === current.hours) {
            current.days.push(entry.day);
        } else {
            let key = current.days.length > 1
                ? `${dayShort(current.days[0])}-${dayShort(current.days[current.days.length - 1])}`
                : dayShort(current.days[0]);
            result[key] = current.hours;
            current = { days: [entry.day], hours: entry.hours };
        }
    }
    // Commit final group
    let key = current.days.length > 1
        ? `${dayShort(current.days[0])}-${dayShort(current.days[current.days.length - 1])}`
        : dayShort(current.days[0]);
    result[key] = current.hours;
    return result;
}

// Full transform
function transformHours(openingHours) {
    if (openingHours.length === 0) return { Hours: {} };
    const grouped = groupDays(openingHours);
    const military = {};
    for (const [key, value] of Object.entries(grouped)) {
        military[key] = rangeToMilitary(value);
    }
    return { Hours: military };
}