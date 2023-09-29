$(document).ready(function () {
	const repoOwner = "RohithBoppey";
	const repoName = "leetcode-sol";
	const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

	$.ajax({
		url: apiUrl,
		dataType: "json",
		success: function (data) {
			renderContents(data);
		},
		error: function (error) {
			console.error("Error fetching repository contents:", error);
		},
	});

	function renderContents(contents) {
		const container = $("#content-container");

		contents.forEach((item) => {
			const element = $("<div>");
			if (item.type === "dir") {
				element.text(`📁 ${item.name}`);
				element.addClass("folder");
				element.click(() => {
					navigateIntoFolder(item.path);
				});
			} else {
				element.text(`📄 ${item.name}`);
				element.addClass("file");
				element.click(() => {
					displayFileContent(item.path);
				});
			}
			container.append(element);
		});
	}

	async function navigateIntoFolder(folderPath) {
		console.log(folderPath);
		const folderApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;

		const data = await fetch(folderApiUrl);
		const jsonData = await data.json();

		console.log(jsonData);
		$("#content-container").empty();
		renderContents(jsonData);
	}

	function getFileContentType(url) {
		const fileExtension = url.split(".").pop().toLowerCase();
		if (fileExtension === "md" || fileExtension === "markdown") {
			return "markdown";
		} else if (fileExtension === "cpp" || fileExtension === "h") {
			return "cpp";
		} else {
			// Default to Markdown if the file extension is unknown
			return "markdown";
		}
	}

	async function displayFileContent(filePath) {
		// Fetch and display the content of the selected file, e.g., in a modal or a separate page
		// You can use filePath to construct the API URL for the file

		const fileApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

		// console.log(fileApiUrl);

		const data = await fetch(fileApiUrl);
		const jsonData = await data.json();

		const contentType = getFileContentType(jsonData.download_url);

		console.log(jsonData);
		console.log(contentType);

		const contentDiv = $("#markdown-content");

		// const fileContent = await response.text();

		$("#content-container").empty();

		if (contentType === "markdown") {
			// If it's Markdown, render it as Markdown
            async function renderReadme() {
                try {
                    const response = await fetch(jsonData.download_url);
                    if (response.ok) {
                        const markdownContent = await response.text();
    
                        // Convert markdown to HTML
                        const converter = new showdown.Converter();
                        const htmlContent = converter.makeHtml(markdownContent);
                        
                        console.log(htmlContent)

                        // Display HTML content in the div
                        const readmeDiv = document.getElementById('readme-content');
                        readmeDiv.innerHTML = htmlContent;
                    } else {
                        throw new Error('Failed to fetch README.md');
                    }
                } catch (error) {
                    console.error(error);
                }
            }
    
            // Load the Showdown library for markdown to HTML conversion
            // You need to include the Showdown library in your project
            // You can download it from https://github.com/showdownjs/showdown
            // or include it from a CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js';
            script.onload = renderReadme;
            document.head.appendChild(script);

		} else {
			// Otherwise, assume it's C++ code and display it as preformatted text
			const codeContentBase64 = jsonData.content;
			const codeContent = atob(codeContentBase64);

			console.log(codeContent);

			const codeElement = document.createElement("pre");
			codeElement.textContent = codeContent;

			document.body.appendChild(codeElement);
		}
	}
});
