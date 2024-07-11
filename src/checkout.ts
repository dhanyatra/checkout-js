// Create a new div element
const newDiv = document.createElement("div");

// Add some content to the div (optional)
newDiv.innerHTML = `<style>
  .dhanyatra-container > iframe { min-height: 100%!important; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>`;

// Add a class and inline styles to the div
newDiv.className = "dhanyatra-container";
newDiv.style.cssText =
  "z-index: 2147483647; position: fixed; top: 0px; display: none; left: 0px; height: 100%; width: 100%; backface-visibility: hidden; overflow-y: visible;";

// Create another div element for the backdrop
const backdropDiv = document.createElement("div");
backdropDiv.className = "dhanyatra-backdrop";

const spinnerDiv = document.createElement("div");
spinnerDiv.className = "dhanyatra-loader";

// Add styles to the backdrop div
const backdropStyles = {
  "min-height": "100%",
  transition: "0.3s ease-out",
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  "justify-content": "center",
  "align-items": "center",
};

const loaderStyles = {
  border: "5px solid #ffffff" /* Light grey */,
  "border-bottom-color": "transparent",
  "border-radius": "50%",
  display: "inline-block",
  "box-sizing": "border-box",
  width: "48px",
  height: "48px",
  animation: "spin 2s linear infinite",
};

Object.assign(backdropDiv.style, backdropStyles);
Object.assign(spinnerDiv.style, loaderStyles);

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
  ark?: {
    user_id: number;
    org_id: number;
  };
  modal: {
    onDismiss: (response: any) => void;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
  };
}

export class Dhanyatra {
  options: DhanyatraOptions;
  private baseUrl: string = "https://api.dhanyatra.brighthustle.in";
  private eventListenerAttached: boolean = false;
  private onSuccessHandled: boolean = false;
  private onDismissHandled: boolean = false;
  private onErrorHandled: boolean = false;

  constructor(options: DhanyatraOptions) {
    if (!options) {
      throw new Error("Options must be provided to the Dhanyatra constructor.");
    }
    this.options = options;
    this.attachEventListener();
  }

  close() {
    const iframe = document.getElementById(
      "dhanyatraIframe"
    ) as HTMLIFrameElement;
    if (iframe) {
      iframe.style.animation = "fadeOut 0.5s";
      this.removeEventListener();
      setTimeout(() => {
        iframe.parentNode?.removeChild(iframe);
        newDiv.style.display = "none";
      }, 500);
    }
  }

  open() {
    this.onSuccessHandled = false;
    this.onDismissHandled = false;
    this.onErrorHandled = false;
    spinnerDiv.style.display = "block";
    // When you call this method, it will display the dhanyatra-container
    newDiv.style.display = "block";
    // Create an iframe element
    const iframe = document.createElement("iframe");
    iframe.setAttribute("id", "dhanyatraIframe");
    Object.assign(iframe.style, {
      opacity: "0",
      height: "100%",
      position: "relative",
      background: "none",
      display: "none",
      border: "0px none transparent",
      margin: "0px",
      padding: "0px",
      zIndex: "2",
      width: "100%",
      animation: "fadeIn 0.5s forwards",
    });
    iframe.frameBorder = "0";
    iframe.setAttribute("allowTransparency", "true");

    // Set the source URL for the iframe
    iframe.src = this.baseUrl;

    // Append the iframe to the dhanyatra-container
    newDiv.appendChild(iframe);

    // Convert the data to a JSON string
    const messageString = JSON.stringify(this.options);

    // Send the data to the iframe
    iframe.addEventListener("load", () => {
      // This function will be called when the iframe has fully loaded
      setTimeout(() => {
        iframe.contentWindow?.postMessage(messageString, "*");
      }, 500);
      setTimeout(() => {
        spinnerDiv.style.display = "none";
        iframe.style.display = "block";
      }, 1000);
      // Now, you can safely send data to the iframe or perform other actions.
    });
  }

  private attachEventListener() {
    if (!this.eventListenerAttached) {
      window.addEventListener("message", (event) => this.handleMessage(event));
      this.eventListenerAttached = true;
    }
  }

  private removeEventListener() {
    if (this.eventListenerAttached) {
      window.removeEventListener("message", (event) =>
        this.handleMessage(event)
      );
      this.eventListenerAttached = false;
    }
  }

  private handleMessage = (event) => {
    const { origin, data } = event;

    // Check the origin of the event for security
    if (origin !== this.baseUrl) {
      return;
    }

    // Handle different message types
    switch (data.action) {
      case "dismissModal":
        this.handleDismissModal(data.data);
        break;
      case "paymentSuccess":
        this.handlePaymentResponse(data.data);
        break;
      case "paymentFailed":
        this.handleErrorResponse(data.data);
        break;
      default:
        this.handleErrorResponse(data.data);
        break;
    }
  };

  private handleDismissModal = (data) => {
    const iframe = document.getElementById(
      "dhanyatraIframe"
    ) as HTMLIFrameElement;
    if (iframe) {
      if (!this.onDismissHandled) {
        this.options.modal.onDismiss(data);
        this.onDismissHandled = true;
      }
    }
  };

  private handlePaymentResponse = (paymentData) => {
    if (
      !this.onSuccessHandled &&
      this.options &&
      this.options.modal &&
      typeof this.options.modal.onSuccess === "function"
    ) {
      this.options.modal.onSuccess(paymentData);
      this.onSuccessHandled = true;
    }
  };

  private handleErrorResponse = (errorData) => {
    if (
      !this.onErrorHandled &&
      this.options &&
      this.options.modal &&
      typeof this.options.modal.onError === "function"
    ) {
      this.options.modal.onError(errorData);
      this.onErrorHandled = true;
    }
  };
}
