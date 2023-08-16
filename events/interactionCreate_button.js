export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ButtonInteractions
   if (!interaction.isButton())
      return;


   // fennec-utilities
   const isBlacklisted = interaction.client.blacklist?.includes(interaction.user.id);

   const developers = JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`));
   const isDeveloper = developers.includes(interaction.user.id);


   // this user is in the global blacklist
   if (isBlacklisted)
      return await interaction.client.fennec.notify(interaction, `blacklist`);


   // maintenance
   if (await interaction.client.fennec.getStatus() === `maintenance` && !isDeveloper)
      return await interaction.client.fennec.notify(interaction, `maintenance`);


   // get this command's file
   const file = await import(`../interactions/button/${interaction.customId.split(`:`)[0]}.js`);


   try {
      // run the file
      await file.default(interaction);


   } catch (error) {
      // an error occurred
      try {
         await interaction.client.fennec.respondToInteractionWithError(interaction);
         await interaction.client.fennec.sendError(error, Math.floor(interaction.createdTimestamp / 1000), interaction);

      } finally {
         console.error(error.stack);
      };
   };


   // offline soon
   const hasSeenOfflineSoonNotification = await interaction.client.fennec.hasSeenNotification(interaction.user, `offline-soon`);

   if (await interaction.client.fennec.getStatus() === `offline-soon` && !hasSeenOfflineSoonNotification) {
      await interaction.client.fennec.notify(interaction, `offline-soon`);
      await interaction.client.fennec.setSeenNotification(interaction.user, `offline-soon`);
   };
};