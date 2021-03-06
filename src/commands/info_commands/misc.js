// -----------------
// Global variables
// -----------------

// Codebeat:disable[LOC,ABC,BLOCK_NESTING,ARITY]
/* eslint-disable no-irregular-whitespace*/
/* eslint-disable no-magic-numbers */
const auth = require("../../core/auth");
const fn = require("../../core/helpers");
const logger = require("../../core/logger");
const process = require("process");
const {stripIndent} = require("common-tags");
const {oneLine} = require("common-tags");
const secConverter = require("rita-seconds-converter");
const sendMessage = require("../../core/command.send");
const botSend = require("../../core/send");
const time = {
   "long": 60000,
   "short": 5000
};

// ------------
// Invite Link
// ------------

module.exports.invite = function invite (data)
{

   data.color = "info";
   data.text = `Invite ${data.message.client.user} `;
   data.text += `\`v${data.config.version}\` to your server\n\n`;
   data.text += `${auth.invite}`;

   // -------------
   // Send message
   // -------------

   return sendMessage(data);

};

// -----------------------
// Get info on all shards
// -----------------------

module.exports.shards = function shards (data)
{

   // ---------------
   // Get shard info
   // ---------------

   const {shard} = data.message.client;

   if (!shard)
   {

      // ---------------
      // Render message
      // ---------------

      data.title = "Shards Info";

      data.footer = {
         "text": "Single Process - No Sharding Manager"
      };

      data.color = "info";

      data.text = `​\n${oneLine`
         :bar_chart:  ​
         **${data.message.client.guilds.cache.size}**  guilds  ·  ​
         **${data.message.client.channels.cache.size}**  channels  ·  ​
         **${data.message.client.users.cache.size}**  users
      `}\n​`;

      // -------------
      // Send message
      // -------------

      return sendMessage(data);

   }

   // --------------------------
   // Get proccess/shard uptime
   // --------------------------

   function shardErr (err)
   {

      return logger(
         "error",
         err,
         "shardFetch",
         data.message.guild.name
      );

   }

   shard.fetchClientValues("guilds.cache.size").then((guildsSize) =>
   {

      shard.fetchClientValues("channels.cache.size").then((channelsSize) =>
      {

         shard.fetchClientValues("users.cache.size").then((usersSize) =>
         {

            const output = [];

            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < shard.count; i += 1)
            {

               output.push({
                  "inline": true,
                  "name": `:pager: - Shard #${i}`,
                  "value": stripIndent`
                     ​
                     **\`${guildsSize[i]}\`** guilds

                     **\`${channelsSize[i]}\`** channels

                     **\`${usersSize[i]}\`** users
                     ​
                  `
               });

            }

            // ---------------
            // Render message
            // ---------------

            data.title = "Shards Info";

            data.text = `​\n${oneLine`
               :bar_chart:   Total:  ​
               **${shard.count}**  shards  ·  ​
               **${fn.arraySum(guildsSize)}**  guilds  ·  ​
               **${fn.arraySum(channelsSize)}**  channels  ·  ​
               **${fn.arraySum(usersSize)}**  users
            `}\n​`;

            data.color = "info";

            data.fields = output;

            // -------------
            // Catch errors
            // -------------

         }).
            catch(shardErr);

      }).
         catch(shardErr);

   }).
      catch(shardErr);

   // -------------
   // Send message
   // -------------

   return sendMessage(data);

};

// ----------------------
// Current proccess info
// ----------------------

module.exports.proc = function proc (data)
{

   // ------------------
   // Get proccess data
   // ------------------

   const title = `**\`${process.title}\`** `;
   const pid = `**\`#${process.pid}\`** `;
   const platform = `**\`${process.platform}\`** `;

   // ---------------
   // Get shard info
   // ---------------

   let {shard} = data.message.client;

   if (!shard)
   {

      shard = {
         "count": 1,
         "id": 0

      };

   }

   // -----------------------
   // Byte formatter (mb/gb)
   // -----------------------

   function byteFormat (bytes)
   {

      if (bytes > 750000000)
      {

         const gb = bytes / 1000 / 1000 / 1000;
         return `${gb.toFixed(3)} gb`;

      }

      const mb = bytes / 1000 / 1000;
      return `${mb.toFixed(2)} mb`;

   }

   // -----------------
   // Get memory usage
   // -----------------

   const memory = process.memoryUsage();
   const memoryFormat = oneLine`
      **\`${byteFormat(memory.rss)}\`** \`rss\` ·
      **\`${byteFormat(memory.heapUsed)}\`**\`/\`
      **\`${byteFormat(memory.heapTotal)}\`** \`heap\` ·
      **\`${byteFormat(memory.external)}\`** \`external\`
   `;

   // --------------------------
   // Get proccess/shard uptime
   // --------------------------

   const procUptime = secConverter(
      Math.round(process.uptime()),
      "sec"
   );

   const shardUptime = secConverter(data.message.client.uptime);

   function uptimeFormat (uptime)
   {

      return oneLine`
         **\`${uptime.days}\`** days
         **\`${uptime.hours}:${uptime.minutes}:${uptime.seconds}\`**
      `;

   }

   // ---------------
   // Render message
   // ---------------

   data.text = stripIndent`
      :robot:  Process:  ${title + pid + platform}

      :control_knobs:  RAM:  ${memoryFormat}

      :stopwatch:  Proc Uptime:  ${uptimeFormat(procUptime)}

      :stopwatch:  Shard Uptime:  ${uptimeFormat(shardUptime)}

      :pager:  Current Shard:  **\`${shard.id + 1} / ${shard.count}\`**
   `;

   // -------------
   // Send message
   // -------------

   sendMessage(data);

};

// --------------
// Ident Message
// --------------

module.exports.ident = function ident (data)
{

   // ------------------
   // Gather ID Details
   // ------------------

   // console.log("DEBUG: ID Message");

   data.color = "info";
   data.text = `**User Name:** \`${data.message.author.username}\`\n` +
   `**User ID:** \`${data.message.author.id}\`\n\n` +
   `**Server Name:** \`${data.message.channel.guild.name}\`\n` +
   `**Server ID:** \`${data.message.channel.guild.id}\`\n\n` +
   `**Bot Name:** \`${data.message.client.user.username}\`\n` +
   `**Bot ID:** \`${data.message.client.user.id}\`\n\n` +
   `**Chan Name:** \`${data.message.channel.name}\`\n` +
   `**Chan ID:** \`${data.message.channel.id}\``;

   // -------------
   // Send message
   // -------------

   return sendMessage(data);

};

module.exports.update = function update (data)
{

   // ------------------
   // Gather ID Details
   // ------------------

   // console.log("DEBUG: ID Message");

   data.color = "info";
   data.text = `*How to Update your bot:* \n\n` +
   `*Heroku Users* \n\n` +
   `**Step 1:** Retrieve your github.com account username \n\n` +
   `**Step 2:** Copy it and replace YOUR_GITHUB_USERNAME_HERE in the URL below: \n\n` +
   "```" +
   `https://github.com/YOUR_GITHUB_USERNAME_HERE/RitaBot/compare/master...RitaBot-Project:master \n\n` +
   "```\n" +
   `**Step 3:** Go to the URL & create the Pull Request. Give the PR a name & accept all changes. \n\n` +
   `**Step 4:** Finally, merge it and re-deploy your bot in Heroku. \n\n` +
   `If you need any help please join our discord server: https://discord.gg/mgNR64R \n\n`;

   // -------------
   // Send message
   // -------------

   data.message.delete({"timeout": time.short}).catch((err) => console.log(
      "Command Message Deleted Error, misc.js = ",
      err
   ));
   return botSend(data);

};
