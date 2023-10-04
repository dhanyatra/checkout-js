// Create a new div element
const newDiv = document.createElement('div');

// Add some content to the div (optional)
newDiv.innerHTML =
  '<style>.dhanyatra-container > iframe {min-height: 100%!important;}</style>';

// Add a class and inline styles to the div
newDiv.className = 'dhanyatra-container';
newDiv.style.cssText =
  'z-index: 2147483647; position: fixed; top: 0px; display: none; left: 0px; height: 100%; width: 100%; backface-visibility: hidden; overflow-y: visible;';

// Create another div element for the backdrop
const backdropDiv = document.createElement('div');
backdropDiv.className = 'dhanyatra-backdrop';

const spinnerDiv = document.createElement('div');
spinnerDiv.className = 'dhanyatra-loader';

// Add styles to the backdrop div
const backdropStyles = {
  'min-height': '100%',
  transition: '0.3s ease-out',
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',
};

const loaderStyles = {
  border: '5px solid #ffffff' /* Light grey */,
  'border-bottom-color': 'transparent',
  'border-radius': '50%',
  display: 'inline-block',
  'box-sizing': 'border-box',
  width: '48px',
  height: '48px',
  animation: 'spin 2s linear infinite',
};

for (const prop in backdropStyles) {
  backdropDiv.style[prop] = backdropStyles[prop];
}

for (const prop in loaderStyles) {
  spinnerDiv.style[prop] = loaderStyles[prop];
}

// Append the backdrop div to the newDiv
backdropDiv.appendChild(spinnerDiv);
newDiv.appendChild(backdropDiv);

// Append the div to the body of the HTML document
document.body.appendChild(newDiv);

interface PaymentBlock {
  [key: string]: {
    name: string;
    instruments: PaymentInstrument[];
  };
}

interface OrderCreatePayload {
  amount: number;
  currency: string;
}

interface PaymentInstrument {
  method: string;
  flows: string[];
  apps: string[];
  issuer: string[];
  banks: string[];
  wallets: string[];
}

interface DhanyatraOptions {
  key: string;
  amount: string;
  currency: string;
  order_id: string;
  organization: string;
  prefill?: {
    email?: string;
    contact?: number;
  };
  config?: {
    display: {
      blocks: PaymentBlock;
      hide: {
        method: string;
      }[];
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
  handler: (response: any) => void;
  ark?: {
    user_id: number;
    org_id: number;
  };
  modal: {
    ondismiss: () => void;
  };
}

export class Dhanyatra {
  options: DhanyatraOptions;
  private baseUrl: string = 'http://localhost:5173';

  constructor(options: DhanyatraOptions) {
    if (!options) {
      throw new Error('Options must be provided to the Dhanyatra constructor.');
    }
    this.options = options;
    this.attachEventListener();
  }

  close() {
    const iframe = document.getElementById(
      'dhanyatraIframe'
    ) as HTMLIFrameElement;
    if (iframe) {
      iframe.parentNode?.removeChild(iframe);
      newDiv.style.display = 'none';
      this.removeEventListener();
    }
  }

  open() {
    if (!this.options.order_id) {
      throw new Error('Order ID is required');
    }
    // When you call this method, it will display the dhanyatra-container
    newDiv.style.display = 'block';
    // Create an iframe element
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'dhanyatraIframe');
    iframe.style.opacity = '1';
    iframe.style.height = '100%';
    iframe.style.position = 'relative';
    iframe.style.background = 'none';
    iframe.style.display = 'block';
    iframe.style.border = '0px none transparent';
    iframe.style.margin = '0px';
    iframe.style.padding = '0px';
    iframe.style.zIndex = '2';
    iframe.style.width = '100%';
    iframe.frameBorder = '0';

    iframe.setAttribute('allowTransparency', 'true');

    // Set the source URL for the iframe
    iframe.src = this.baseUrl;

    // Append the iframe to the dhanyatra-container
    newDiv.appendChild(iframe);

    // Convert the data to a JSON string
    const messageString = JSON.stringify(this.options);
    // Send the data to the iframe
    iframe.addEventListener('load', () => {
      // This function will be called when the iframe has fully loaded
      // spinnerDiv.style.display = 'none'
      setTimeout(() => {
        iframe.contentWindow?.postMessage(messageString, '*');
      }, 1000);

      // Now, you can safely send data to the iframe or perform other actions.
    });
  }

  private attachEventListener() {
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  private removeEventListener() {
    window.removeEventListener('message', (event) => this.handleMessage(event));
  }

  private handleMessage = (event) => {
    const { origin, data } = event;

    // Check the origin of the event for security
    if (origin !== this.baseUrl) {
      return;
    }

    // Handle different message types
    switch (data) {
      case 'dismissModal':
        this.handleDismissModal();
        break;
      case 'paymentResponse':
        this.handlePaymentResponse(data);
        break;
      // Add more cases as needed
      default:
        break;
    }
  };

  private handleDismissModal = () => {
    // if (
    //   this.options &&
    //   this.options.modal &&
    //   typeof this.options.modal.ondismiss === 'function'
    // ) {
    //   console.log('test');
    //   this.options.modal.ondismiss();
    // }
    const iframe = document.getElementById(
      'dhanyatraIframe'
    ) as HTMLIFrameElement;
    if (iframe) {
      iframe.parentNode?.removeChild(iframe);
      newDiv.style.display = 'none';
      this.removeEventListener();
    }
  };

  private handlePaymentResponse = (paymentData) => {
    if (
      this.options &&
      this.options.handler &&
      typeof this.options.handler === 'function'
    ) {
      this.options.handler(paymentData);
    }
  };

  private async createOrder(orderPayload: OrderCreatePayload) {
    try {
      if (!this.options.key) {
        throw new Error('App key is missing');
      }
      const orderResponse = await fetch(`${this.baseUrl}/api/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });
      return orderResponse;
    } catch (error) {
      throw new Error(error);
    }
  }
}
