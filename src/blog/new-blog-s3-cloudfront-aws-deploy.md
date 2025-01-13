---
title: 'Welcome to the jungle'
description: 'Or when I decided to make a blog with an (almost) full new stack and deploy it.'
pubDate: 2025-12-03
tags: ["astro", "blogging", "learning in public"]
theme: "https://www.youtube.com/watch?v=tGsKzZtRwxw" 
shown: true
---

## New beginnings

New year new me, and I've wanted to start a blog for quite some time now. 
My motivations are ***simple***, I want to share cool stuff I learn. And so, I've learned an almost new stack, yeah, did I said I wanted to learn cool new things? 

I looked at past year <a href="https://2024.stateofjs.com/en-US" target="_blank">state of javascript</a>... Vue, React, Svelte, yeah we know these ones... what about this one, ***Astro*** ? Yeah I've heard of it, what can it do?

My face when I saw how cool Astro is: <inline style="font-size:xx-large;"> 🤯</inline>

```sh title="Let's start!"
npm create astro@latest -- --template minimal
```

Now, we just have to follow <a href="https://docs.astro.build/en/tutorial/0-introduction/" target="_blank">the guide</a> and we'll have a blog up and running in no time. Then it is just a matter of tweaking the css, html and a bit of javascript to customize your site (we know these ones right?)... right? 

After almost 7 years of frontend development, using React with a lot of handmade components and even an in-house design system made with tailwind, I almost forgot about vanilla javascript and css. But in the end, what can't we do with the basics? (spoiler: <s>*almost*</s> nothing)

<small>I just won't talk about the whole day I took to code a custom AudioPlayer, only to realize that I would probably be striked for not using royalty free music... 
Anyway, let's just build the blog for now.</small>

```sh title="📦"
npm run build
```
We now have a /dist folder with all your assets. The blog is ready, it's time to deploy.

> [!NOTE]
> We used Astro but the deploy part would work the same on any other javascript framework like Vue, or React that build a /dist (or /build) folder.

Ever heard of Vercel, Netlify, Github Pages ? Please use that if you want something done quick, otherwise...

Time to use the AWS suite, specifically S3 and CloudFront. AWS amplify exists also, but it's costly, and it's for normies. I assume you already have a domain name, otherwise you can purchase one using Route53 (which is the domain name registrar of amazon) or any other registrar. Let's begin:


## S3

First, you'll need to create a new AWS account if you don't have one.

- Create your AWS account. 
- Select your region.

> [!WARNING]
> Pricing depend on usage of the different services and region.


S3 (for Simple Storage Service) is where you put your /dist (or /build) files, it's like an online folder. It's easy enough to understand. You first need to create a new S3 bucket (that's how amazon call their folders).

- Search the S3 service on the top search bar, select it and click "create bucket".
- Change the bucket name to be the same as your domain name. (e.g nicolasvelay.com)
- Uncheck "Block all public access". For now your bucket will be public and accessible from everywhere. That will change once we dive into CloudFront.
- Create your bucket. 

| Are we... done?

*Hell no*

- Go to the bucket list and select your newly created bucket. 
- Click on the "Properties" tab.
- Scroll until "Static web hosting", select edit and enable it.
- "Index document" should be index.html, "Error document" should be whatever html document you made for 404 errors.

Ok our bucket is set up. ***Or is it?*** Yeah did you think that just unchecking public access would do ? No, no, no... AWS got a lot of security features, and we need to add a policy for the bucket. 

- Go to the permission tab.
- Edit the bucket policy and add the following. (Be mindful to change your arn with your actual bucket name, e.g nicolasvelay.com)

```json {9}
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<MY_BUCKET_NAME>/*"
        }
    ]
}
```
<p></p>


> [!NOTE]
> "Arn" are identifiers for your ressources at AWS, since there is a lot of services, we need unique identifiers. 

| Please tell me we are done... 

Yeah, we are done for bucket configuration. Now we need to put our local /dist folder (the thing we build earlier) into the bucket. There is an upload button in the "Objects" tab of your bucket, simple, easy.

***Or...***

We could also use the aws CLI. Trust me, this one is cool.


### How to feel like Neo: use the AWS CLI

So one of the good practice in AWS is to create an user for each of what you do, this way, if the user is compromised, your whole AWS account won't turn Skynet.

IAM (for Identity Access Management) is the AWS service to create users and attach policies (what they can do on your account) to them.

- Go to the IAM service interface (use the top search-bar).
- Create a new user with the chosen name (e.g aws-cli).
- Attach required policies. You can attach the "AdministratorAccess" and your user will have admin rights.
- Create the user.

> [!WARNING]
> In virtue of the Zero-Trust strategy for cybersecurity, it's better to round the policy of every user you create to their bare minimum. If you intend to only use the AWS CLI to update your S3 bucket and cloudfront distribution, you can only give it these rights.

We created the aws-cli IAM user, now we need to retrieve its access keys.

- Go to the security credentials tab for this user.
- Create an access key. (Select CLI for use case)

Now on linux, install the aws cli. On Ubuntu:

```sh title="Installing the aws cli"
apt install awscli
```

Then configure and paste your previously created access key ID and value. Your default region name, and the output format (XML or JSON)

```sh title="Configuring the aws cli" {3, 4}
aws configure

AWS Access Key ID [None]: ***************
AWS Secret Access Key [None]: **************
Default region name [None]: <YOUR_AWS_REGION>
Default output format [None]: JSON
```

And now, the magic happens. We can use the CLI to copy the /dist local folder to our bucket:

```sh title="Copying your local files to the bucket"
s3 sync dist/ s3://<MY_BUCKET_NAME>
```
<p></p>

> [!NOTE]
> Make sure you are in the same folder than our blog.

We can now look into our previously created bucket and see your files in the "Objects" tab. Also, we can go in the "Properties" tab, scroll to the very bottom and there should be a link, our "Bucket website endpoint". Click on it and....

<img height=300 src="https://i.gifer.com/2Gb.gif" alt="Magic" />

You now have access to your site.

> [!IMPORTANT]
> We will continue, erm... not using the aws cli. But note that everything that we will do through the UI can be done with the aws cli. 

| So.. we're done ?

Your site is ... not secure unfortunately, noted by the lock icon in the navbar of your browser. Also, what in hell is this URL ? Do we really want to share that ? No, no, no... So it is time for...

## CloudFront

But first...

### Create a certificate

Yeah, we want that S (for Secure) in HTTPS. So we will create a free public certificate thanks to AWS. We will use another service called ACM (for AWS Certificate Manager).

- Navigate to the service and request a public certificate.
- Input your domain name, don't change anything else.

Now, we are on the certificate detail, pending validation. In the "Domains" subsection, we have a table with your domain and most importantly a CNAME name and a CNAME value.

I'll heavily summarize but AWS is "pinging" the CNAME name (which is a subdomain of you domain, if you noticed) and expect it to reroute to the CNAME value, this way, they can exchange some info.

- Go to your Domain Name registrar and search for the option to ADD a CNAME record. (It's a redirection from the "NAME" to the "VALUE")
- Input in the CNAME name the one you copied from ACM, same for the CNAME value.
- Wait for your domain to be certified.

> [!NOTE]
> AWS got its own registrar service called Route 53.

### Create your distribution

Now we can create a distribution in Cloudfront (for ... Cloudfront. <small><small>Who comes up with these names anyway?</small></small>) this is a content delivery network (CDN) where you'll be able to set some settings like cache and security.

- Go to the Cloudfront service and select your bucket as "origin domain". (AWS kindly tells us to use the "website endpoint", so let's do that)
- Scroll until "Viewer protocol policy" and select "Redirect HTTP to HTTPS".
- You can disable the WAF for now. It's a paid feature, but it's a must-have if your site needs to be secure.
- Add an "Alternate domain name (CNAME)" with the value of your domain name. 
- Select the custom SSL certificate that you just created. 
- Create the distribution.

We now have a more secure distribution, that will handle cache by default, it's a must over S3. (And it will lower the costs !)

We can now go to the "General" tab of our distribution detail and click on the url under "Distribution domain name", it's our distribution URL, and now we have a lock icon indicating that the browser is using https.

<img height=300 src="https://media1.tenor.com/m/qVKlQMB2DpsAAAAd/hacker-hacking.gif" alt="Take that hackers!" />

<!-- ![magic](https://media1.tenor.com/m/qVKlQMB2DpsAAAAd/hacker-hacking.gif) -->

However, the URL is kinda ugly and you don't want to share this one with your Grandma, or else she might think it is a phishing link. (Who said elder people cannot recognize malicious links? Wake up, it's not 2010 anymore.)

### Redirect in your registrar

Remember when we talked about CNAME redirection for the certificate ? We have to do the same but for your domain name.

- Again, go to your Domain Name registrar and add a CNAME record.
- Input in the CNAME name your domain name (e.g nicolasvelay.com), and for the CNAME value, your distribution URL.

Now your domain name is redirecting to your cloudfront distribution.

### Cleaning up

We made the bucket public, but it is not secure, let's now remove the option

- Go to your bucket details.
- Go to the "Permissions" tab and edit "Block public access"
- Check "Block all public access" and save changes

| Now we're done, right ?

Yes, congratulations ! 🎉🎉🎉  You now have a fully functionnal static blog hosted on AWS. Isn't that cool ?

Next we will want to setup a pipeline so that we don't have to update manually the S3 bucket each time we push a new change to our blog. We will set up a github actions in a next post. You used Github to save everything up till now right?... right?
