import { when } from 'mobx';
import wireService from '../../src/wire/WireService';
import WireStore from '../../src/wire/WireStore';


jest.mock('../../src/wire/WireService');

/**
 * Wire service
 */
describe('wire store', () => {
  let store;

  beforeEach(() => {
    store = new WireStore();
  });

  it('should set the guid', () => {
    // should have a default null
    expect(store.guid).toBe(null);

    store.setGuid('123123');

    // should change to the new value
    expect(store.guid).toBe('123123');
  });

  it('should set the owner', () => {
    // should have a default null
    expect(store.owner).toBe(null);

    store.setOwner({name: 'someone'});

    // should change to the new value
    expect(store.owner).toEqual({name: 'someone'});
  });

  it('should set the amount', () => {
    // should have a default 1
    expect(store.amount).toBe(1);

    store.setAmount(2);

    // should change to the new value
    expect(store.amount).toBe(2);
  });

  it('should set recurring', () => {
    // should have a default 1
    expect(store.recurring).toBe(false);

    store.setRecurring(true);

    // should change to the new value
    expect(store.recurring).toBe(true);
  });

  it('should set sending in false', () => {

    store.sending = true;

    store.stopSending();

    // should change to the new value
    expect(store.sending).toBe(false);
  });

  it('should toggle recurring', () => {
    // should have a default 1
    expect(store.recurring).toBe(false);

    store.toggleRecurring();
    // should toggle to true
    expect(store.recurring).toBe(true);

    store.toggleRecurring();
    // should toggle to false
    expect(store.recurring).toBe(false);
  })

  it('should load the user rewards from the service', async (done) => {
    const fakeOwner = {name: 'someone'};
    const fakeGuid = '123123';

    wireService.userRewards.mockResolvedValue(fakeOwner);

    try {
      const result = await store.loadUser(fakeGuid);
      // should return the owner
      expect(result).toEqual(fakeOwner);
      // should set the owner
      expect(store.owner).toEqual(fakeOwner);
    } catch (e) {
      done.fail(e);
    }
    done();
  });

  it('should not set the owner if load rewards fails', async (done) => {
    const fakeGuid = '123123';

    wireService.userRewards.mockRejectedValue(new Error('fakeError'));

    try {
      await store.loadUser(fakeGuid);
      done.fail();
    } catch (e) {
      // should not set the owner
      expect(store.owner).toEqual(null);
      done();
    }
  });

  it('should round a number', () => {
    // should round with the correct precision
    expect(store.round(2.345, 2)).toEqual(2.35);
    expect(store.round(2.342, 2)).toEqual(2.34);
    expect(store.round(2.3422, 3)).toEqual(2.342);
    expect(store.round(2.3426, 3)).toEqual(2.343);
  });

  it('should format the amount', () => {
    expect(store.formatAmount(12222.3333)).toEqual('12,222.333 tokens');
    expect(store.formatAmount(222.3333)).toEqual('222.333 tokens');
    expect(store.formatAmount(245)).toEqual('245 tokens');
  });

  it('should reset the obvservable values', () => {

    store.amount = 2;
    store.sending = true;
    store.owner = {};
    store.recurring = true;
    store.guid = '123123';

    store.reset();

    // should reset all
    expect(store.amount).toEqual(1);
    expect(store.sending).toEqual(false);
    expect(store.owner).toEqual(null);
    expect(store.recurring).toEqual(false);
    expect(store.guid).toEqual(null);
  });

  it('should return if already sending', () => {
    store.sending = true;
    return expect(store.send()).resolves.toBeUndefined();
  });

  it('should send a wire', async(done) => {
    const fakeDone = {done: true};
    wireService.send.mockResolvedValue(fakeDone);

    expect.assertions(4);
    try {

      // should set sending in true
      when(
        () => store.sending,
        () => expect(store.sending).toEqual(true)
      );

      const result = await store.send();

      // should return the service call result
      expect(result).toBe(fakeDone);

      // should set sending in false on finish
      expect(store.sending).toEqual(false);

      // should call the service
      expect(wireService.send).toBeCalledWith({
        amount: store.amount,
        guid: store.guid,
        owner: store.owner,
        recurring: store.recurring
      });

      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should throw on send a wire', async(done) => {
    const fakeDone = {done: true};
    wireService.send.mockRejectedValue(fakeDone);

    expect.assertions(3);
    try {

      // should set sending in true
      when(
        () => store.sending,
        () => expect(store.sending).toEqual(true)
      );

      await store.send();


      done.fail('should fail');
    } catch (e) {

      // should call the service
      expect(wireService.send).toBeCalledWith({
        amount: store.amount,
        guid: store.guid,
        owner: store.owner,
        recurring: store.recurring
      });

      // should set sending in false on finish
      expect(store.sending).toEqual(false);
      done();
    }
  });
});