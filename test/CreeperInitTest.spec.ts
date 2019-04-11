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

        flow.put('length', length.toString())

        return creeper;
      }
    })

    flow.step('Find page github and get text', {

      execute: async () => {

        const creeper: Creeper = new Creeper()

        await creeper.goto('https://github.com/');

        const text = creeper.getText('body > div.application-main > main > div.py-6.py-sm-8.jumbotron-codelines > div > div > div.col-md-7.text-center.text-md-left > h1')

        flow.put('centerText', text)

        return creeper;
      }
    })
    
    await flow.executeAll()

    console.log(`Length ${flow.get('length')} && Center text: ${flow.get('centerText')}`)


    //expect(length).to.greaterThan(8000);
  });

});