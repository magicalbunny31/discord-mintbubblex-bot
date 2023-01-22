import Discord from "discord.js";
import { colours, emojis, noop, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 */
export default async interaction => {
   // modal info
   const [ _modal ] = interaction.customId.split(`:`);


   // fields
   const reason = interaction.fields.getTextInputValue(`reason`);


   // the original interaction message got deleted
   if (!interaction.message)
      return await interaction.reply({
         content: `❌ The Verification Form was deleted, no action has been taken.`,
         ephemeral: true
      });


   // update the interaction
   for (const actionRow of interaction.message.components)
      for (const button of actionRow.components)
         button.data.disabled = true;

   Object.assign(interaction.message.components[0].components[1].data, {
      label: null,
      emoji: Discord.parseEmoji(emojis.loading)
   });

   await interaction.update({
      components: interaction.message.components
   });


   // get this member
   const id = interaction.message.embeds[0].footer.text;
   const member = await interaction.guild.members.fetch(id);


   // edit this member's roles
   await member.roles.add   (process.env.ROLE_UNVERIFIED);
   await member.roles.remove(process.env.ROLE_AWAITING_VERIFICATION);


   // try to dm the member about this denial
   try {
      const embeds = [
         new Discord.EmbedBuilder()
            .setColor(interaction.message.embeds[0].color)
            .setDescription(strip`
               📝 Your Verification Form was denied.
               💬 You can view the reason for the denial below.
            `)
            .setFooter({
               text: interaction.guild.name,
               iconURL: interaction.guild.iconURL({
                  extension: `png`,
                  size: 4096
               })
            }),
         new Discord.EmbedBuilder()
            .setColor(colours.red)
            .setDescription(
               Discord.codeBlock(reason)
            )
      ];

      const components = [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setLabel(`View Server`)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(`https://discord.com/channels/${process.env.GUILD_FOXIE}`)
            )
      ];

      await member.send({
         embeds,
         components
      });

   } catch {
      noop;
   };


   // edit the verification form's embed
   return await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder(interaction.message.embeds[0].data)
            .setFooter({
               text: `❌ Denied by ${interaction.user.tag}`,
               iconURL: interaction.user.displayAvatarURL({
                  extension: `png`,
                  size: 4096
               })
            }),
         new Discord.EmbedBuilder()
            .setColor(colours.red)
            .setDescription(
               Discord.codeBlock(reason)
            )
      ],
      components: []
   });
};