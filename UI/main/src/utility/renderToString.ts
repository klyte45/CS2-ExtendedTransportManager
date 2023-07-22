import ReactDOM from "react-dom";

export default async function (element: JSX.Element) {
    return await new Promise<string>((res) => {
        let myDiv = document.createElement('div');
        ReactDOM.render(element, myDiv, () => {
            const result = myDiv.innerHTML;
            myDiv = null;
            res(result);
        });
    })

}

