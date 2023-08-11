import { ValueObject } from '@baseunit/edd';

type CurrencyProps = {
  code: string;
  name: string;
}

class Currency extends ValueObject<CurrencyProps> {
  constructor(props: CurrencyProps) {
    super(props);
  }

  getCode(): string {
    return this.value.code;
  }

  getName(): string {
    return this.value.name;
  }
}

// Usage
const usd1 = new Currency({ code: 'USD', name: 'US Dollar' });
const usd2 = new Currency({ code: 'USD', name: 'US Dollar' });

console.log(usd1.equals(usd2)); // Output: true
console.log(usd1 === usd2); // Output: false (reference comparison)
const props = usd1.value;
// props.code = 'asdasasdasd'; // must not be allowed
console.log(usd1.getCode()); // Output: 'USD'
console.log(usd1.getName()); // Output: 'US Dollar'
console.log(usd1.value); // Output: { code: 'USD', name: 'US Dollar' }


class Test1 extends ValueObject<{ color: string }> {}
class Test2 extends ValueObject<string> {}
const test1 = new Test1({ color: 'green' });
const test2 = new Test1({ color: 'green' });
// const test1 = new Test2('value');
let a = test1.value;
console.log('---');
console.log('Test', test1);
console.log(test1.equals(test2)); // Output: true
console.log(test1 === test2); // Output: false (reference comparison)
console.log('Test value', test1.value);
console.log('Test JSON', JSON.stringify(test1));
// console.log('Test JSON', test1.toJSON());


const uuidv4 = () => {
  return 'asdfasdfasdf';
}
class UUID extends ValueObject<string> {
  constructor(value: string) {
    // Make sure the provided value is a valid UUID
    if (!UUID.isValidUUID(value)) {
      throw new Error('Invalid UUID format.');
    }
    super(value);
  }
  // Helper method to validate UUID format
  private static isValidUUID(value: string): boolean {
    // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // return uuidRegex.test(value);
    return true;
  }
  // Generate a new random UUID
  static generate(): UUID {
    return new UUID(uuidv4());
  }
}

class UserName extends ValueObject<string> {
  constructor(name: string = '') {
    if (name && name.length > 10) {
      throw new Error('User name must be no more than 10 characters.');
    }
    super(name);
  }
}

// const userName = new UserName();
const userName = new UserName('asdfasdfdd');
console.log(`userName: [${userName.value}]`);

const uuid1 = new UUID('some uuid');
// const uuid1 = UUID.generate();
console.log('---');
console.log(uuid1);
console.log(uuid1.value);