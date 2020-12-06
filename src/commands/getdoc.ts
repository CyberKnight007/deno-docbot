import { Command, CommandContext, Embed } from '../../deps.ts'
import { getNode, NodeEmoji, NodeEmojiURL } from '../util/docs.ts'

// had to make it becuse then i would have had to change a lot of stuff ;-;
const config = {
  module: 'https/raw.githubusercontent.com/harmony-org/harmony/main/mod.ts',
}

export default class GetDocCommand extends Command {
  name = 'Get'
  aliases = ['GetDocs', 'GetDoc', 'DocInfo', 'Info']
  usage = ['<Name>']
  examples = ['ClientOptions', 'CommandClient']
  description = 'Get Doc info of a Class, etc or their method/property.'

  execute(ctx: CommandContext) {
    const node = getNode(ctx.argString)
    if (!node)
      return ctx.message.reply("Couldn't find docs for the given name.")

    const embed = new Embed()
      .setTitle(`${node.name} (${node.kind})`)
      .setURL(
        `https://doc.deno.land/${node.location.filename.replace(
          'https://',
          'https/'
        )}`
      )
      .setColor(0x0dbc6a)

    if (node.jsDoc != null) embed.setDescription(node.jsDoc)

    // Check if the input is a interface
    if (node.interfaceDef !== undefined) {
      const def = node.interfaceDef
      if (def.extends.length)
        embed.addField(
          'Extends',
          def.extends.map((e) => (e as any).repr).join(', ')
        )
      if (def.properties.length) {
        const proptxt = def.properties
          .map(
            (prop) =>
              `• **${prop.name}${prop.optional ? '?' : ''}:** ${
                prop.tsType?.fnOrConstructor
                  ? `(${prop.tsType?.fnOrConstructor?.params.map(
                      (prop) =>
                        `${prop.name}${prop.optional ? '?' : ''}: ${
                          (prop.tsType?.array.repr
                            ? prop.tsType?.array.repr
                            : null) ||
                          (prop.tsType?.array.keyword
                            ? prop.tsType?.keyword
                            : null) ||
                          prop.tsType?.union
                            ?.map((t) => {
                              if (t.array) {
                                return `${
                                  `${t.array?.repr}[]` ||
                                  `${t.array?.keyword}[]` ||
                                  'unknown[]'
                                }`
                              }
                              return `${t.repr || t.keyword || 'unknown'}`
                            })
                            .join(' | ') ||
                          prop.tsType?.typeRef?.typeName ||
                          'unknown'
                        }`
                    )}) => `
                  : `${
                      (prop.tsType?.array.repr
                        ? prop.tsType?.array.repr
                        : null) ||
                      (prop.tsType?.array.keyword
                        ? prop.tsType?.keyword
                        : null) ||
                      prop.tsType?.union
                        ?.map((t) => {
                          if (t.array) {
                            return `${
                              `${t.array?.repr}[]` ||
                              `${t.array?.keyword}[]` ||
                              'unknown[]'
                            }`
                          }
                          return `${t.repr || t.keyword || 'unknown'}`
                        })
                        .join(' | ')
                    }`
              }${prop.jsDoc != null ? ` - ${prop.jsDoc}` : ''}`
          )
          .join('\n')

        const leftover = proptxt.length > 1000
        if (leftover) {
          const bulletIndex = proptxt.substring(0, 1000).lastIndexOf('•') - 1
          embed.addField('Properties', proptxt.substring(0, bulletIndex))
          embed.addField('\u200b', proptxt.substring(bulletIndex, 2000))
        } else {
          embed.addField('Properties', proptxt.substring(0, 1000))
        }
      }
    }

    // Check if the input is a enum
    else if (node.enumDef !== undefined) {
      const def = node.enumDef
      const proptxt = def['members']
        .map((member) => `• ${member['name']}`)
        .join('\n')
      const leftover = proptxt.length > 1000
      if (leftover) {
        const bulletIndex = proptxt.substring(0, 1000).lastIndexOf('•') - 1
        embed.addField('Members', proptxt.substring(0, bulletIndex))
        embed.addField('\u200b', proptxt.substring(bulletIndex, 2000))
      } else {
        embed.addField('Members', proptxt.substring(0, 1000))
      }
    }

    // Check if the input is a Class
    else if (node.classDef !== undefined) {
      const def = node.classDef
      if (def.extends) {
        embed.addField('Extends', def.extends)
      }
      if (def.constructors.length) {
        console.log(def.constructors[0].params)
        const proptxt = def.constructors[0].params
          .map((prop) => {
            return prop.left
              ? `• **${prop.left.name}:** ${
                  `[${prop.left.tsType?.repr}](https://doc.deno.land/${config.module}#${prop.left.tsType?.repr})` ||
                  `[${prop.left.tsType?.keyword}](https://doc.deno.land/${config.module}#${prop.left.tsType?.keyword})` ||
                  prop.left.tsType?.union
                    ?.map(
                      (t) =>
                        `[${t.repr}](https://doc.deno.land/${config.module}#${t.repr})` ||
                        `[${t.keyword}](https://doc.deno.land/${config.module}#${t.keyword})`
                    )
                    .join(' | ') ||
                  `[${prop.left.tsType?.typeRef?.typeName}](https://doc.deno.land/${config.module}#${prop.left.tsType?.typeRef?.typeName})` ||
                  'unknown'
                }${
                  def.constructors[0].jsDoc != null
                    ? ` - ${def.constructors[0].jsDoc}`
                    : ''
                }`
              : `• **${prop.name}:** ${
                  `[${prop.tsType?.repr}](https://doc.deno.land/${config.module}#${prop.tsType?.repr})` ||
                  `[${prop.tsType?.keyword}](https://doc.deno.land/${config.module}#${prop.tsType?.keyword})` ||
                  prop.tsType?.union
                    ?.map(
                      (t) =>
                        `[${t.repr}](https://doc.deno.land/${config.module}#${t.repr})` ||
                        `[${t.keyword}](https://doc.deno.land/${config.module}#${t.keyword})`
                    )
                    .join(' | ') ||
                  `[${prop.tsType?.typeRef?.typeName}](https://doc.deno.land/${config.module}#${prop.tsType?.typeRef?.typeName})` ||
                  'unknown'
                }${
                  def.constructors[0].jsDoc != null
                    ? ` - ${def.constructors[0].jsDoc}`
                    : ''
                }`
          })
          .join('\n')

        const leftover = proptxt.length > 1000
        if (leftover) {
          const bulletIndex = proptxt.substring(0, 1000).lastIndexOf('•') - 1
          embed.addField('Constructor', proptxt.substring(0, bulletIndex))
          embed.addField('\u200b', proptxt.substring(bulletIndex, 2000))
        } else {
          embed.addField('Constructor', proptxt.substring(0, 1000))
        }
      }
      if (def.properties.length) {
        const proptxt = def.properties
          .map(
            (prop) =>
              `• **${prop.name}${prop.optional ? '?' : ''}:** ${
                (prop.tsType?.array.repr ? prop.tsType?.array.repr : null) ||
                (prop.tsType?.array.keyword ? prop.tsType?.keyword : null) ||
                prop.tsType?.union
                  ?.map((t) => {
                    if (t.array) {
                      return `${
                        `${t.array?.repr}[]` ||
                        `${t.array?.keyword}[]` ||
                        'unknown[]'
                      }
                        `
                    }
                    return `${t.repr || t.keyword || 'unknown'}`
                  })
                  .join(' | ') ||
                prop.tsType?.typeRef?.typeName ||
                'unknown'
              }${prop.jsDoc != null ? ` - ${prop.jsDoc}` : ''}`
          )
          .join('\n')

        const leftover = proptxt.length > 1000
        if (leftover) {
          const bulletIndex = proptxt.substring(0, 1000).lastIndexOf('•') - 1
          embed.addField('Properties', proptxt.substring(0, bulletIndex))
          embed.addField('\u200b', proptxt.substring(bulletIndex, 2000))
        } else {
          embed.addField('Properties', proptxt.substring(0, 1000))
        }
      }

      if (def.methods.length) {
        const proptxt = def.methods
          .map(
            (prop) =>
              `• **${prop.name}${prop.optional ? '?' : ''}:** ${
                prop.jsDoc != null ? ` - ${prop.jsDoc}` : ''
              }`
          )
          .join('\n')

        const leftover = proptxt.length > 1000
        if (leftover) {
          const bulletIndex = proptxt.substring(0, 1000).lastIndexOf('•') - 1
          embed.addField('Methods', proptxt.substring(0, bulletIndex))
          embed.addField('\u200b', proptxt.substring(bulletIndex, 2000))
        } else {
          embed.addField('Methods', proptxt.substring(0, 1000))
        }
      }
    }

    ctx.channel.send(embed)
  }
}
