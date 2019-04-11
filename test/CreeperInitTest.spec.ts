import { Creeper } from "../src/core/Creeper"
import { CreeperFlow } from "../src/flow/CreeperFlow"
import { expect } from 'chai';
import 'mocha';

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

        await creeper.goto('https://github.com/search',{ queryParams: queryParams });

        const results = creeper.getText('#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div > div.d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative > h3')

        flow.contex('results', results)

        return creeper;
      }
    })

    await flow.executeAll()

    expect(flow.contex('results')).to.equals('52 repository results');
  });

});