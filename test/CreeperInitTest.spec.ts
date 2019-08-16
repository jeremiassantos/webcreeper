import { Creeper, CreeperFlow } from "../src/index"
import { expect } from 'chai';
import 'mocha';
import fs from "fs"
import path from "path"
import { CreeperCall } from "../src/handle/CreeperCall";

describe('Init creeper test', () => {

  it('Verify size of content html', async () => {


    const creeper: Creeper = new Creeper()

    await creeper.goto('https://github.com/');

    const length = creeper.toHtml().length;

    creeper.destroy()

    expect(length).to.greaterThan(8000);
  });

  it('Get text by selector', async () => {

    const creeper: Creeper = new Creeper()

    await creeper.goto('https://github.com/');

    const text = creeper.getText('body > div.application-main > main > div.py-6.py-sm-8.jumbotron-codelines > div > div > div.col-md-7.text-center.text-md-left > h1')

    creeper.destroy()

    expect(text).to.equals('Built for developers');
  });

  it('Verify element exists: true', async () => {

    const creeper: Creeper = new Creeper()

    await creeper.goto('https://github.com/');

    const exists = creeper.exists('body > div.application-main > main > div.py-6.py-sm-8.jumbotron-codelines > div > div > div.col-md-7.text-center.text-md-left > h1')

    creeper.destroy()

    expect(exists).to.true;
  });

  it('Verify element exists: false', async () => {

    const creeper: Creeper = new Creeper()

    await creeper.goto('https://github.com/');

    const exists = creeper.exists('fack > element')

    creeper.destroy()

    expect(exists).to.false;
  });



  it('Add step in flow test', async () => {

    const flow: CreeperFlow = new CreeperFlow()

    flow.step('Find page github', {

      execute: async () => {

        const creeper: Creeper = new Creeper()

        await creeper.goto('https://github.com/');

        const length = creeper.toHtml().length

        flow.contex('length', length.toString())

        return creeper;
      }
    })

    flow.step('Find page github and get text', {

      execute: async () => {

        const creeper: Creeper = new Creeper()

        await creeper.goto('https://github.com/');

        const text = creeper.getText('body > div.application-main > main > div.py-6.py-sm-8.jumbotron-codelines > div > div > div.col-md-7.text-center.text-md-left > p > a:nth-child(1)')

        flow.contex('centerText', text)

        return creeper;
      }
    })

    await flow.executeAll()

    expect(flow.contex('centerText')).to.equals('open source');
    expect(Number(flow.contex('length'))).to.greaterThan(8000);
  });

  it('Add step in flow and input options of request', async () => {

    const flow: CreeperFlow = new CreeperFlow()

    flow.step('Search user in github', {

      execute: async () => {

        const creeper: Creeper = new Creeper()

        const queryParams: Map<string, string> = new Map()

        queryParams.set('q', 'jeremias')

        await creeper.goto('https://github.com/search', { queryParams: queryParams });

        const results = creeper.getText('#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div > div.d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative > h3')

        flow.contex('results', results)

        return creeper;
      }
    })

    await flow.executeAll()

    expect(flow.contex('results')).to.equals('54 repository results');
  });

  it('Add domain for config session', async () => {

    const flow: CreeperFlow = new CreeperFlow()

    flow.setGlobalSessionConfig('github.com')

    flow.step('Search user in github', {

      execute: async () => {

        const creeper: Creeper = new Creeper()

        await creeper.goto('https://github.com/');

        const length = creeper.toHtml().length

        flow.contex('length', length.toString())

        return creeper;
      }
    })

    await flow.executeAll()

    const sessionInfo = JSON.parse(JSON.stringify(CreeperCall.getCreeperState().getCookie()))

    expect(sessionInfo._jar.cookies.length).to.equals(8);
  });

  it('Parse table', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(getContentHtml('table.html'))

    const positions = [
      { key: 1, value: 'company' },
      { key: 2, value: 'contact' },
      { key: 3, value: 'country' }
    ]

    const companys = creeper.parseTable({ selector: '#customers', skipHeader: true, positions: positions })

    expect(companys.length).to.equals(6);
    expect(companys[0].company).to.equals('Alfreds Futterkiste');
    expect(companys[0].contact).to.equals('Maria Anders');
    expect(companys[0].country).to.equals('Germany');
  });

  it('Parse table', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(getContentHtml('table.html'))

    const positions = [
      { key: 1, value: 'company' },
      { key: 2, value: 'contact' },
      { key: 3, value: 'country' }
    ]

    const companys = creeper.parseTable({ selector: '#customers', skipHeader: true, positions: positions })

    expect(companys.length).to.equals(6);
    expect(companys[0].company).to.equals('Alfreds Futterkiste');
    expect(companys[0].contact).to.equals('Maria Anders');
    expect(companys[0].country).to.equals('Germany');
  });

  it('Parse table to string', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(getContentHtml('table.html'))

    const parser = creeper.parseTableToString({ selector: '#customers', skipHeader: true})

    expect(parser.length).to.greaterThan(6);
    
  });

  it('Parse table with custom extract', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(getContentHtml('table.html'))

    const positions = [
      { key: 1, value: 'company' },
      { key: 2, value: 'contact' },
      { key: 3, value: 'country' }
    ]

    const customExtract = {
      extract: (clild, item) => {
        const id = clild.find('form input[type="hidden"]:nth-child(2)').attr('value');
        item.id = id
      }
    }

    const companys = creeper.parseTable({ selector: '#customers', skipHeader: true, positions: positions, extract: customExtract })

    expect(companys.length).to.equals(6);
    expect(companys[0].company).to.equals('Alfreds Futterkiste');
    expect(companys[0].contact).to.equals('Maria Anders');
    expect(companys[0].country).to.equals('Germany');
    expect(companys[0].id).to.equals('sdsdsds55555');
  });

  it('Get Values of Select', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(
    "<select class=\"list_items\">\n"+
    "  <option value=\"\">Select option</option>" +
    "  <option value=\"1\">Blue</option>\n"+
    "  <option value=\"2\">Origin</option>\n"+
    "  <option value=\"3\">Red</option>\n"+
    "  <option value=\"4\">Green</option>\n"+
    "</select>")

    const values = creeper.getValuesSelect('.list_items')

    expect(values.length).to.equals(5);
    expect(values[0].id).to.equals('');
    expect(values[0].value).to.equals('Select option');
    expect(values[4].id).to.equals('4');
    expect(values[4].value).to.equals('Green');
  });

  it('Get Values of Select and skip value empty', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(
    "<select class=\"list_items\">\n"+
    "  <option value=\"\">Select option</option>" +
    "  <option value=\"1\">Blue</option>\n"+
    "  <option value=\"2\">Origin</option>\n"+
    "  <option value=\"3\">Red</option>\n"+
    "  <option value=\"4\">Green</option>\n"+
    "</select>")

    const values = creeper.getValuesSelect('.list_items', true)

    expect(values.length).to.equals(4);
  });

  it('Parse ul to list', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(
      "<ul class=\"TabbedPanelsTabGroup\" style=\"font-size:10px;\">" +
        "<li class=\"TabbedPanelsTab titulo_abas_internas\">Regra Geral</li>" +
        "<li class=\"TabbedPanelsTab titulo_abas_internas\">Suspensão</li>" +
        "<li class=\"TabbedPanelsTab titulo_abas_internas\">ZFM</li>" +
        "<li class=\"TabbedPanelsTab titulo_abas_internas\">Exportação</li>" +
        "<li class=\"TabbedPanelsTab titulo_abas_internas\">Importação</li>\n"+
      "</ul>")

    const values = creeper.parseUlToList(".TabbedPanelsTabGroup")

    expect(values.length).to.equals(5);
  });

  it('Get attributes children', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(
    "<td rowspan=\"3\" class=\"TabbedPanelsTabGroup\">\n"+
    "  <p><a href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art3\" target=\"blank\">Artigo 3Âº</a> e <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15_p1_iii_a\" target=\"blank\">alÃ\u00ADnea \"a\"</a>\n"+
    "    do <a href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15_p1_iii\" target=\"blank\">inciso III</a>\n"+
    "    do <a href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15_p1\" target=\"blank\">Â§ 1Âº</a> do <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15\" target=\"blank\">artigo 15</a> da <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp\" target=\"blank\">Lei nÂº 9.249/95</a>; <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9250_1995.asp#art40\" target=\"blank\">artigo 40</a> da <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9250_1995.asp\" target=\"blank\">Lei nÂº 9.250/95</a>.</p>\n"+
    "</td>")

    const values = creeper.getAttributesByChildren('body > p', 'href')

    expect(values.length).to.equals(8);
  });

  it('Get values children', async () => {

    const creeper: Creeper = new Creeper()

    creeper.setHtmlManual(
    "<td rowspan=\"3\" class=\"TabbedPanelsTabGroup\">\n"+
    "  <p><a href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art3\" target=\"blank\">Artigo 3Âº</a> e <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15_p1_iii_a\" target=\"blank\">alÃ\u00ADnea \"a\"</a>\n"+
    "    do <a href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15_p1_iii\" target=\"blank\">inciso III</a>\n"+
    "    do <a href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15_p1\" target=\"blank\">Â§ 1Âº</a> do <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp#art15\" target=\"blank\">artigo 15</a> da <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9249_1995.asp\" target=\"blank\">Lei nÂº 9.249/95</a>; <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9250_1995.asp#art40\" target=\"blank\">artigo 40</a> da <a\n"+
    "      href=\"http://www.econeteditora.com.br/bdi/lei/ant/lei9250_1995.asp\" target=\"blank\">Lei nÂº 9.250/95</a>.</p>\n"+
    "</td>")

    const values = creeper.getValuesByChildren('body > p')

    expect(values.length).to.equals(8);
  });

});

function getContentHtml(filename) {
  return fs.readFileSync(path.join(__dirname, './' + filename), 'utf8');
}