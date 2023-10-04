<div align="center">
  <h1> Dhanyatra Checkout JS</h1>
  <p>A web checkout module to invoke instant payment.</p>
</div>

<br />

<div align="center">

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url] [![synk-image]][synk-url]

</div>

<div align="center">
  <h3>
    <a href="#installation">
      Usage
    </a>
    <span> | </span>
    <a href="https://dhanyatra.brighthustle.in">
      Checkout Dhanyatra
    </a>
  </h3>
</div>

<br />

<hr />

Dhanyatra Checkout-JS is a JavaScript library tailored for seamless integration with Dhanyatra's payment gateway. It empowers developers to effortlessly incorporate Dhanyatra's payment features into their applications. By offering a clean and intuitive API, Dhanyatra Checkout-JS simplifies the process of handling payments, providing businesses with a robust solution for processing transactions and enhancing the checkout experience for customers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

  - [Installation](#installation)
  - [Usage](#usage)
- [Events](#events)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Install the package from the npm registry as follows:

```sh
npm i @dhanyatra/checkout-js

# yarn
yarn add @dhanyatra/checkout-js

# pnpm
pnpm add @dhanyatra/checkout-js
```

## Usage

The module exposes a `Dhanyatra` class, which can be used to payment server and listen for payments events.

```ts
import { Dhanyatra } from '@dhanyatra/checkout-js';

const options = {
    key: 'Mw.9BnMszEkdEOE8OYmSPA0-IvISRHJCkUUKalSR_keJ2zWT9vFQtUsgfXM2ryn', // Enter the Key ID generated from the Dashboard
    amount: '500', // Any amount can be float
    currency: 'INR', // Currently only INR accepted
    organization: "Hustler's Academy", // Name to be displayed of organization
    image: 'https://i.imgur.com/n5tjHFD.png', // Logo to be displayed of organization
    handler: function (response) {
        //response after payment event either Success or Failed
        alert(response.dhanyatra_payment_id);
    },
    modal: {
    //Modal Handler inside payment gateway
      ondismiss: function () {
        //Dismiss Modal Handler
        let txt = '';
        if (confirm('Are you sure, you want to close the form?')) {
          txt = 'You pressed OK!';
          console.log('Checkout form closed by the user');
          rzp1.close();
        } else {
          txt = 'You pressed Cancel!';
          console.log('Complete the Payment');
        }
      },
    },
}

// Setup Dhanyatra options
const dhanyatra = new Dhanyatra(options)
// Trigger Payment
dhanyatra.open();
```

Using the package as script tag on HTML

```js
<script type="module">
    import { Dhanyatra } from 'https://www.unpkg.com/@dhanyatra/checkout-js@0.0.2/build/checkout.modern.js';

    const options = {
        key: 'Mw.9BnMszEkdEOE8OYmSPA0-IvISRHJCkUUKalSR_keJ2zWT9vFQtUsgfXM2ryn', // Enter the Key ID generated from the Dashboard
        amount: '500', // Any amount can be float
        currency: 'INR', // Currently only INR accepted
        organization: "Hustler's Academy", // Name to be displayed of organization
        image: 'https://i.imgur.com/n5tjHFD.png', // Logo to be displayed of organization
        handler: function (response) {
            //response after payment event either Success or Failed
            alert(response.dhanyatra_payment_id);
        },
        modal: {
        //Modal Handler inside payment gateway
          ondismiss: function () {
            //Dismiss Modal Handler
            let txt = '';
            if (confirm('Are you sure, you want to close the form?')) {
              txt = 'You pressed OK!';
              console.log('Checkout form closed by the user');
              rzp1.close();
            } else {
              txt = 'You pressed Cancel!';
              console.log('Complete the Payment');
            }
          },
        },
    }

    // Setup Dhanyatra options
    const dhanyatra = new Dhanyatra(options)
    // Trigger Payment
    dhanyatra.open();
<script type="module">
```

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/DhanYatra/checkout-js/test?style=for-the-badge
[gh-workflow-url]: https://github.com/DhanYatra/checkout-js/actions/workflows/test.yml "Github action"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"

[npm-image]: https://img.shields.io/npm/v/@dhanyatra/checkout-js.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@dhanyatra/checkout-js 'npm'

[license-image]: https://img.shields.io/npm/l/@dhanyatra/checkout-js?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md 'license'

[synk-image]: https://img.shields.io/snyk/vulnerabilities/github/DhanYatra/checkout-js?label=Synk%20Vulnerabilities&style=for-the-badge
[synk-url]: https://snyk.io/test/github/DhanYatra/checkout-js?targetFile=package.json "synk"