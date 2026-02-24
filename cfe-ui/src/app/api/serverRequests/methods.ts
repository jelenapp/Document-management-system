const server_address = "http://localhost:5000"; // process.env.SERVER_ADDRESS

export async function getRequestSingle(
  method_route: string,
  param?: string,
  param_value?: string | null
) {
  method_route = method_route.trim().replace(/^\/+/, "");
  let url = `${server_address}/${method_route}`;

  if (param && param_value != null) {
    const qs = new URLSearchParams({ [param.trim()]: String(param_value) });
    url += `?${qs.toString()}`;
  }

  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function postRequest(method_route: string, data: any) {
    method_route = method_route.trim();
    const url = server_address + "/" + method_route; 
    const res = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
  });

    return res;
}

export async function putRequest(method_route: string, data: any) {
    method_route = method_route.trim();
    const url = server_address + "/" + method_route; 
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return res;
}

export async function deleteRequest(method_route: string, param?: string, param_value?: string, data?: any) {
    method_route = method_route.trim();
    let url = server_address + "/" + method_route;

    if (param !== undefined && param_value !== undefined)
        url += "?" + encodeURIComponent(param) + "=" + encodeURIComponent(param_value);

    const options: RequestInit = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (data !== undefined) {
        options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    return res;
}