import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export const dynamic = "force-dynamic";

const ALL_BRAINROTS = {"Noobini Pizzanini":"Common","Lirilì Larilà":"Common","Tim Cheese":"Common","Fluriflura":"Common","Svinina Bombardino":"Common","Talpa Di Fero":"Common","Pipi Kiwi":"Common","Pipi Corni":"Common","Raccooni Jandelini":"Common","Tartaragno":"Common","Noobini Santanini":"Common","Holy Arepa":"Common","Trippi Troppi":"Rare","Gangster Footera":"Rare","Boneca Ambalabu":"Rare","Ta Ta Ta Ta Sahur":"Rare","Tric Trac Baraboom":"Rare","Bandito Bobritto":"Rare","Cacto Hipopotamo":"Rare","Pipi Avocado":"Rare","Pinealotto Fruttarino":"Rare","Cupcake Koala":"Rare","Frogo Elfo":"Rare","Pengolino Nuvoletto":"Rare","Cappuccino Assassino":"Epic","Brr Brr Patapim":"Epic","Trulimero Trulicina":"Epic","Bananita Dolphinita":"Epic","Brri Brri Bicus Dicus Bombicus":"Epic","Bambini Crostini":"Epic","Perochello Lemonchello":"Epic","Avocadini Guffo":"Epic","Salamino Penguino":"Epic","Ti Ti Ti Sahur":"Epic","Penguino Cocosino":"Epic","Avocadini Antilopini":"Epic","Bandito Axoloto":"Epic","Malame Amarele":"Epic","Mangolini Parrocini":"Epic","Mummio Rappitto":"Epic","Frogato Pirato":"Epic","Wombo Rollo":"Epic","Doi Doi Do":"Epic","Penguin Tree":"Epic","Gato Celesto":"Epic","Burbaloni Loliloli":"Legendary","Chimpanzini Bananini":"Legendary","Ballerina Cappuccina":"Legendary","Chef Crabracadabra":"Legendary","Glorbo Fruttodrillo":"Legendary","Blueberrinni Octopusini":"Legendary","Lionel Cactuseli":"Legendary","Pandaccini Bananini":"Legendary","Strawberrelli Flamingelli":"Legendary","Cocosini Mama":"Legendary","Pi Pi Watermelon":"Legendary","Sigma Boy":"Legendary","Pipi Potato":"Legendary","Quivioli Ameleonni":"Legendary","Caramello Filtrello":"Legendary","Sigma Girl":"Legendary","Quackula":"Legendary","Buho de Fuego":"Legendary","Clickerino Crabo":"Legendary","Puffaball":"Legendary","Chocco Bunny":"Legendary","Sealo Regalo":"Legendary","Buho del Cielo":"Legendary","Seraphino Gruyero":"Legendary","Frigo Camelo":"Mythic","Orangutini Ananassini":"Mythic","Bombardiro Crocodilo":"Mythic","Bombombini Gusini":"Mythic","Rhino Toasterino":"Mythic","Cavallo Virtuoso":"Mythic","Spioniro Golubiro":"Mythic","Zibra Zubra Zibralini":"Mythic","Tigrilini Watermelini":"Mythic","Gorillo Watermelondrillo":"Mythic","Avocadorilla":"Mythic","Ganganzelli Trulala":"Mythic","Tob Tobi Tobi":"Mythic","Te Te Te Sahur":"Mythic","Tracoducotulu Delapeladustuz":"Mythic","Lerulerulerule":"Mythic","Carloo":"Mythic","Carrotini Brainini":"Mythic","Brutto Gialutto":"Mythic","Gorillo Subwoofero":"Mythic","Los Noobinis":"Mythic","Rhino Helicopterino":"Mythic","Toiletto Focaccino":"Mythic","Cachorrito Melonito":"Mythic","Bananito Bandito":"Mythic","Magi Ribbitini":"Mythic","Jacko Spaventosa":"Mythic","Stoppo Luminino":"Mythic","Centrucci Nuclucci":"Mythic","Jingle Jingle Sahur":"Mythic","Tree Tree Tree Sahur":"Mythic","Spongini Quackini":"Mythic","Fizzy Soda":"Mythic","Harpuccino":"Mythic","Berenjello Angello":"Mythic","Chihuanini Taconini":"Brainrot God","Cocofanto Elefanto":"Brainrot God","Tralalero Tralala":"Brainrot God","Odin Din Din Dun":"Brainrot God","Girafa Celestre":"Brainrot God","Trenostruzzo Turbo 3000":"Brainrot God","Matteo":"Brainrot God","Tigroligre Frutonni":"Brainrot God","Orcalero Orcala":"Brainrot God","Unclito Samito":"Brainrot God","Gattatino Nyanino":"Brainrot God","Espresso Signora":"Brainrot God","Ballerino Lololo":"Brainrot God","Piccione Macchina":"Brainrot God","Los Crocodillitos":"Brainrot God","Tukanno Bananno":"Brainrot God","Trippi Troppi Troppa Trippa":"Brainrot God","Los Tungtungtungcitos":"Brainrot God","Bulbito Bandito Traktorito":"Brainrot God","Los Orcalitos":"Brainrot God","Tipi Topi Taco":"Brainrot God","Bombardini Tortinii":"Brainrot God","Tralalita Tralala":"Brainrot God","Urubini Flamenguini":"Brainrot God","Alessio":"Brainrot God","Pakrahmatmamat":"Brainrot God","Los Bombinitos":"Brainrot God","Brr es Teh Patipum":"Brainrot God","Tartaruga Cisterna":"Brainrot God","Cacasito Satalito":"Brainrot God","Mastodontico Telepiedone":"Brainrot God","Crabbo Limonetta":"Brainrot God","Gattito Tacoto":"Brainrot God","Los Tipi Tacos":"Brainrot God","Las Capuchinas":"Brainrot God","Orcalita Orcala":"Brainrot God","Piccionetta Macchina":"Brainrot God","Anpali Babel":"Brainrot God","Extinct Ballerina":"Brainrot God","Tractoro Dinosauro":"Brainrot God","Belula Beluga":"Brainrot God","Capi Taco":"Brainrot God","Corn Corn Corn Sahur":"Brainrot God","Brasilini Berimbini":"Brainrot God","Squalanana":"Brainrot God","Pop Pop Sahur":"Brainrot God","Vampira Cappucina":"Brainrot God","Jacko Jack Jack":"Brainrot God","Snailenzo":"Brainrot God","Tentacolo Tecnico":"Brainrot God","Pakrahmatmatina":"Brainrot God","Bambu Bambu Sahur":"Brainrot God","Krupuk Pagi Pagi":"Brainrot God","Mummy Ambalabu":"Brainrot God","Cappuccino Clownino":"Brainrot God","Skull Skull Skull":"Brainrot God","Aquanaut":"Brainrot God","Frio Ninja":"Brainrot God","Money Money Man":"Brainrot God","Noo La Polizia":"Brainrot God","Los Chihuaninis":"Brainrot God","Los Gattitos":"Brainrot God","Granchiello Spiritell":"Brainrot God","Ballerina Peppermintina":"Brainrot God","Ginger Globo":"Brainrot God","Ginger Cisterna":"Brainrot God","Yeti Claus":"Brainrot God","Buho de Noelo":"Brainrot God","Chrismasmamat":"Brainrot God","Cocoa Assassino":"Brainrot God","Pandanini Frostini":"Brainrot God","Tootini Shrimpini":"Brainrot God","Boba Panda":"Brainrot God","Dolphini Jetskini":"Brainrot God","Luv Luv Luv":"Brainrot God","Karkerheart Luvkur":"Brainrot God","Divino Platypio":"Brainrot God","Astrolero Cervalero":"Brainrot God","Dumborino Miracello":"Brainrot God","Patteo":"Brainrot God","Clovkur Kurkur":"Brainrot God","La Vacca Saturno Saturnita":"Secret","Los Tralaleritos":"Secret","Graipuss Medussi":"Secret","La Grande Combinasion":"Secret","Sammyni Spyderini":"Secret","Garama and Madundung":"Secret","Torrtuginni Dragonfrutini":"Secret","Las Tralaleritas":"Secret","Pot Hotspot":"Secret","Nuclearo Dinossauro":"Secret","Las Vaquitas Saturnitas":"Secret","Chicleteira Bicicleteira":"Secret","Agarrini la Palini":"Secret","Los Combinasionas":"Secret","Karkerkar Kurkur":"Secret","Dragon Cannelloni":"Secret","Los Hotspotsitos":"Secret","Esok Sekolah":"Secret","Nooo My Hotspot":"Secret","Los Matteos":"Secret","Job Job Job Sahur":"Secret","Dul Dul Dul":"Secret","Blackhole Goat":"Secret","Los Spyderinis":"Secret","Ketupat Kepat":"Secret","La Supreme Combinasion":"Secret","Bisonte Giuppitere":"Secret","Guerriro Digitale":"Secret","Ketchuru and Musturu":"Secret","Spaghetti Tualetti":"Secret","Los Nooo My Hotspotsitos":"Secret","Trenostruzzo Turbo 4000":"Secret","Fragola La La La":"Secret","La Sahur Combinasion":"Secret","La Karkerkar Combinasion":"Secret","Tralaledon":"Secret","Los Bros":"Secret","Los Chicleteiras":"Secret","Chachechi":"Secret","Extinct Tralalero":"Secret","Extinct Matteo":"Secret","67":"Secret","Las Sis":"Secret","Celularcini Viciosini":"Secret","La Extinct Grande":"Secret","Quesadilla Crocodila":"Secret","Tacorita Bicicleta":"Secret","La Cucaracha":"Secret","To to to Sahur":"Secret","Mariachi Corazoni":"Secret","Los Tacoritas":"Secret","Tictac Sahur":"Secret","Yess my examine":"Secret","Karker Sahur":"Secret","Noo my examine":"Secret","Money Money Puggy":"Secret","Los Primos":"Secret","Tang Tang Keletang":"Secret","Perrito Burrito":"Secret","Chillin Chili":"Secret","Los Tortus":"Secret","Los Karkeritos":"Secret","Los Jobcitos":"Secret","Los 67":"Secret","La Secret Combinasion":"Secret","Burguro And Fryuro":"Secret","Zombie Tralala":"Secret","Vulturino Skeletono":"Secret","Frankentteo":"Secret","La Vacca Jacko Linterino":"Secret","Chicleteirina Bicicleteirina":"Secret","Eviledon":"Secret","La Spooky Grande":"Secret","Los Mobilis":"Secret","Spooky and Pumpky":"Secret","Boatito Auratito":"Secret","Horegini Boom":"Secret","Rang Ring Bus":"Secret","Mieteteira Bicicleteira":"Secret","Quesadillo Vampiro":"Secret","Burrito Bandito":"Secret","Chipso and Queso":"Secret","Jackorilla":"Secret","Pumpkini Spyderini":"Secret","Trickolino":"Secret","Telemorte":"Secret","Pot Pumpkin":"Secret","Noo my Candy":"Secret","Los Spooky Combinasionas":"Secret","La Casa Boo":"Secret","La Taco Combinasion":"Secret","1x1x1x1":"Secret","Capitano Moby":"Secret","Guest 666":"Secret","Pirulitoita Bicicleteira":"Secret","Los Puggies":"Secret","Los Spaghettis":"Secret","Fragrama and Chocrama":"Secret","Swag Soda":"Secret","Orcaledon":"Secret","Los Cucarachas":"Secret","Los Burritos":"Secret","Los Quesadillas":"Secret","Cuadramat and Pakrahmatmamat":"Secret","Fishino Clownino":"Secret","Los Planitos":"Secret","W or L":"Secret","Lavadorito Spinito":"Secret","Gobblino Uniciclino":"Secret","Giftini Spyderini":"Secret","Tung Tung Tung Sahur":"Secret","Cooki and Milki":"Secret","25":"Secret","La Vacca Prese Presente":"Secret","Reindeer Tralala":"Secret","Santteo":"Secret","Please my Present":"Secret","List List List Sahur":"Secret","Ho Ho Ho Sahur":"Secret","Chicleteira Noelteira":"Secret","La Jolly Grande":"Secret","Los Candies":"Secret","Triplito Tralaleritos":"Secret","Santa Hotspot":"Secret","La Ginger Sekolah":"Secret","Reinito Sleighito":"Secret","Naughty Naughty":"Secret","Noo my Present":"Secret","Los 25":"Secret","Chimnino":"Secret","Festive 67":"Secret","Swaggy Bros":"Secret","Bunnyman":"Secret","Dragon Gingerini":"Secret","Donkeyturbo Express":"Secret","Money Money Reindeer":"Secret","Los Jolly Combinasionas":"Secret","Jolly Jolly Sahur":"Secret","Ginger Gerat":"Secret","Rocco Disco":"Secret","Bunito Bunito Spinito":"Secret","Tuff Toucan":"Secret","Cerberus":"Secret","GOAT":"Secret","Brunito Marsito":"Secret","Los Trios":"Secret","Chill Puppy":"Secret","Arcadopus":"Secret","Spinny Hammy":"Secret","Bacuru and Egguru":"Secret","Ketupat Bros":"Secret","Hydra Dragon Cannelloni":"Secret","Mi Gatito":"Secret","Los Mi Gatitos":"Secret","Popcuru and Fizzuru":"Secret","Love Love Love Sahur":"Secret","Cupid Cupid Sahur":"Secret","Cupid Hotspot":"Secret","Noo my Heart":"Secret","Chicleteira Cupideira":"Secret","Lovin Rose":"Secret","La Romantic Grande":"Secret","Rosetti Tualetti":"Secret","Love Love Bear":"Secret","Rosey and Teddy":"Secret","Los Sweethearts":"Secret","Sammyni Fattini":"Secret","La Food Combinasion":"Secret","Los Sekolahs":"Secret","Los Amigos":"Secret","Tirilikalika Tirilikalako":"Secret","Antonio":"Secret","Elefanto Frigo":"Secret","Signore Carapace":"Secret","Fishboard":"Secret","DJ Panda":"Secret","Ventoliero Pavonero":"Secret","Celestial Pegasus":"Secret","Tacorillo Crocodillo":"Secret","Nacho Spyder":"Secret","Paradiso Axolottino":"Secret","Serafinna Medusella":"Secret","Cigno Fulgoro":"Secret","Los Cupids":"Secret","Griffin":"Secret","La Vacca Lepre Lepreino":"Secret","Luck Luck Luck Sahur":"Secret","Noo my Gold":"Secret","Snailo Clovero":"Secret","Gold Gold Gold":"Secret","Fortunu and Cashuru":"Secret","Cloverat Clapat":"Secret","Dug dug dug":"Secret","La Lucky Grande":"Secret","Eid Eid Eid Sahur":"Secret","Granny":"Secret","Foxini Lanternini":"Secret","Skibidi Toilet":"OG","Strawberry Elephant":"OG","Headless Horseman":"OG","Meowl":"OG"};

function formatNumber(n) {
  if (n >= 1e15) return (n / 1e15).toFixed(1) + "Q";
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("brainrot-tracker");

    const totals = await db.collection("totals").findOne({ _id: "global" });
    const counts = totals?.counts || {};
    const muts = totals?.mutations || {};
    const trs = totals?.traits || {};
    const owners = totals?.owners || {};
    const avgRebirths = totals?.avgRebirths || {};
    const avgCoins = totals?.avgCoins || {};
    const bGens = totals?.baseGens || {};
    const tGens = totals?.totalGens || {};
    const totalPlayers = totals?.totalPlayers || 1;

    const url = new URL(request.url);
    const detail = url.searchParams.get("name");
    const searchUser = url.searchParams.get("user");

    // Player search
    if (searchUser) {
      const query = searchUser.match(/^\d+$/)
        ? { odiumId: searchUser }
        : { $or: [
            { username: { $regex: searchUser, $options: "i" } },
            { displayName: { $regex: searchUser, $options: "i" } },
          ]};

      const player = await db.collection("players").findOne(query);
      if (!player) {
        return NextResponse.json({ found: false });
      }

      return NextResponse.json({
        found: true,
        userId: player.odiumId,
        username: player.username,
        displayName: player.displayName,
        rebirth: player.rebirth,
        coins: player.coins,
        animals: player.animals,
        lastSeen: player.lastSeen,
      });
    }

    // Detail view
    if (detail) {
      const count = counts[detail] || 0;
      const ownerCount = owners[detail] || 0;
      const pct = totalPlayers > 0 ? ((ownerCount / totalPlayers) * 100) : 0;

      return NextResponse.json({
        name: detail,
        count,
        rarity: ALL_BRAINROTS[detail] || "Unknown",
        mutations: muts[detail] || {},
        traits: trs[detail] || {},
        owners: ownerCount,
        ownerPercentage: Math.round(pct * 100) / 100,
        avgRebirth: Math.round((avgRebirths[detail] || 0) * 10) / 10,
        avgCoins: avgCoins[detail] || 0,
        avgCoinsFormatted: formatNumber(Math.round(avgCoins[detail] || 0)),
        baseGen: bGens[detail] || 0,
        baseGenFormatted: formatNumber(bGens[detail] || 0),
        totalGen: tGens[detail] || 0,
        totalGenFormatted: formatNumber(Math.round(tGens[detail] || 0)),
        totalPlayers,
      });
    }

    // Main list
    const brainrots = Object.entries(ALL_BRAINROTS)
      .map(([name, rarity]) => {
        const count = counts[name] || 0;
        const ownerCount = owners[name] || 0;
        const pct = totalPlayers > 0 ? ((ownerCount / totalPlayers) * 100) : 0;
        return {
          name,
          rarity,
          count,
          owners: ownerCount,
          percentage: Math.round(pct * 100) / 100,
          avgRebirth: Math.round((avgRebirths[name] || 0) * 10) / 10,
          avgCoins: formatNumber(Math.round(avgCoins[name] || 0)),
        };
      })
      .sort((a, b) => b.percentage - a.percentage || b.count - a.count);

    const totalExist = brainrots.reduce((sum, b) => sum + b.count, 0);

    return NextResponse.json({
      brainrots,
      totalExist,
      totalPlayers,
      lastUpdated: totals?.lastUpdated || null,
    });
  } catch (error) {
    console.error("Counts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}