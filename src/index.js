require('dotenv').config();
const axios = require("axios");
const {Client,IntentsBitField, SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
var cron = require("cron");


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates
    ]
})


client.on("ready", ()=>
{
    console.log("sono pronto");
    const saluta =  new SlashCommandBuilder()
                        .setName("saluta")
                        .setDescription(":)");

    client.application.commands.create(saluta);
});



client.on("messageCreate", (message)=>
    {
        if(!message.author.bot && message.content.toLowerCase().includes("bot") && message.content.toLowerCase().includes("saluta") && !message.content.toLowerCase().includes("non"))
            message.reply("ciao "+message.author.displayName);

        if(message.content=="Dai ruolo a tutti")
            daiRuoli();

        if(message.content.startsWith("Espelli"))
            espelliSanto(message);

        if(message.content=="riassunto")
            riassunto(message);
        else
            if(message.content.startsWith("riassunto"))
                riassuntoGenerico(message);

    }


);

function riassuntoGenerico(message,stefano=false){
    let options = {
        headers: {
            'X-Riot-Token': process.env.TOKENRIOT
          }
    };
    let name;
    let tag;
    if(stefano)
    {
        name="Zupo";
        tag="195;"
    }
    else
    {
        let messaggioSplittato = message.content.replace("riassunto","").split("#");
        name= messaggioSplittato[0];
        tag= messaggioSplittato[1];
    }
    try
    {
        axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,options).then(
            resp=> 
            {
                let puuid = resp.data.puuid;
                axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`,options).then(
                    resp2=>
                    {
                        let matchid= resp2.data[0];
                        axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchid}`,options).then(
                            resp3=>
                            {
                                let match = resp3.data;
    
                                let modalita = match.info.gameMode;
                                let pos = match.metadata.participants.findIndex(p=> p==puuid);
                                let kda = match.info.participants[pos].challenges.kda;
                                let champion = match.info.participants[pos].championName;
                                let fine = match.info.participants[pos].nexusLost==0 ? "vinta" : "persa";
    
                                let msg = `Giocato ${modalita}  ${fine} con ${champion} e un kda di ${kda}`;
                                
                                message.reply(msg);
                            }
                            
                        )
    
                    }
                )
            }
        )
    }
    catch(e)
    {
        message.reply("fallito");
    }
}


function riassunto(message){
    riassuntoGenerico(message,true)
}

async function espelliSanto(message)
{
    
    let nome = message.content.replace("Espelli ","");
    const guild = client.guilds.cache.get(process.env.IDSERVER);
    
    const role = guild.roles.cache.get(process.env.IDRUOLOSPIATO);
    await guild.members.fetch();
    let utenti = guild.members.cache.forEach(m=>m.displayName==nome && m.kick("Perchè sì"));
}

async function daiRuoli()
{
    const guild = client.guilds.cache.get(process.env.IDSERVER);
    
    const role = guild.roles.cache.get(process.env.IDRUOLOSPIATO);
    await guild.members.fetch();
    let utenti = guild.members.cache.forEach(m=>m.displayName.toLowerCase().startsWith("s") && m.roles.add(role));


}

client.on('guildMemberAdd', member => 
    {
        const role = member.guild.roles.cache.get("1263476315949105243");
        console.log(role);

        member.roles.add(role); 
    }
);
client.on('interactionCreate', (interaction) =>
    {
           
        
        switch (interaction.commandName) {
            case "saluta":
                metodoSaluta(interaction);
            break;
        
            default:
                break;
        }
    }
);

function metodoSaluta(interaction)
{
    if(interaction.member.roles.cache.has("1263476315949105243"))
        interaction.reply("Ciao vi saluto");
    else
    interaction.reply("NOOO!!!");
}

// client.on('interactionCreate', (interaction) =>
// {
//     if(!interaction.isChatInputCommand()) return;
//     if(interaction.commandName=="volontario" || interaction.commandName=="vocale")
//     {
        
//         
//         let id_canale = interaction.channelId;
        
//         if(!cache[id_canale])
//         {
//             cache[id_canale] = {vol:[],cont:0};
//         }
        
//         let persone = guild.members.cache.filter(member => member.voice.channelId==id_canale);
       
         
//         let pers = [];
//         for(let p of persone)
//         {
//             if(p[1].user.id!="784124917377531934" && p[1].user.id!="123164689252352001")
//             {
//                 let nick = "";
//                 nick =(p[1].nickname|| p[1].user.displayName)+"";
//                 nick=  nick.charAt(0).toUpperCase() + nick.slice(1);
//                 if(!cache[id_canale].vol.includes(nick))
//                     pers.push(nick);
//             }
//         }
        
//         if(pers.length==0)
//         {
//             cache[id_canale] = {vol:[],cont:0};

//             for(let p of persone)
//             {
//                 if(p[1].user.id!="784124917377531934" && p[1].user.id!="123164689252352001")
//                 {
//                     let nick = "";
//                     nick =(p[1].nickname|| p[1].user.displayName)+"";
//                     nick=  nick.charAt(0).toUpperCase() + nick.slice(1);
//                     pers.push(nick);
//                 }
//             }
//         }

//         let nomeVolontario = pers[Math.floor(Math.random()*pers.length)];
//         cache[id_canale].vol[cache[id_canale].cont]=nomeVolontario;
//         cache[id_canale].cont++;
//         if(cache[id_canale]>=durataAssoluzione)
//             cache[id_canale].cont=0;

//         console.log(nomeVolontario);

//         if(interaction.commandName=="vocale")
//             interaction.reply({content:"Si offre volontariamente: "+nomeVolontario,tts:true});
//         else
//             interaction.reply("Si offre volontariamente: "+nomeVolontario);
//     };

// });


client.login(process.env.TOKEN);