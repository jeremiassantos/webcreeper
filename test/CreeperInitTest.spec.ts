import { Creeper } from "../src/core/Creeper"
import { expect } from 'chai';
import 'mocha';

describe('Hello function', () => {

  it('should return hello world', () => {


    const creeper: Creeper = new Creeper()

    creeper.goto('');

    //console.log(creeper)

    creeper.destroy()

    const result = 'Hello world!';
    expect(result).to.equal('Hello world!');
  });

});